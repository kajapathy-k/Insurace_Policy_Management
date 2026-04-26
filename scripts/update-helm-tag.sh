#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <service_name> <image_tag> <environment: dev|prod>" >&2
  exit 1
fi

SERVICE_NAME="$1"
IMAGE_TAG="$2"
ENVIRONMENT="$3"

case "$ENVIRONMENT" in
  dev|prod) ;;
  *)
    echo "Invalid environment: $ENVIRONMENT. Allowed values: dev, prod" >&2
    exit 1
    ;;
esac

CHART_PATH="${HELM_CHART_PATH:-$SERVICE_NAME}"
VALUES_FILE="helm/${CHART_PATH}/values-${ENVIRONMENT}.yaml"
IMAGE_REPOSITORY="ghcr.io/insurance-policy-management-org/${SERVICE_NAME}"

if [ ! -f "$VALUES_FILE" ]; then
  echo "Values file not found: $VALUES_FILE" >&2
  exit 1
fi

if command -v yq >/dev/null 2>&1; then
  HAS_IMAGE_KEYS="$(yq eval '(.image | type == "!!map") and (.image | has("repository")) and (.image | has("tag"))' "$VALUES_FILE")"
  if [ "$HAS_IMAGE_KEYS" != "true" ]; then
    echo "Expected existing image.repository and image.tag in: $VALUES_FILE" >&2
    exit 1
  fi

  yq eval -i ".image.repository = \"${IMAGE_REPOSITORY}\" | .image.tag = \"${IMAGE_TAG}\"" "$VALUES_FILE"
else
  TMP_FILE="$(mktemp)"

  awk -v repo="$IMAGE_REPOSITORY" -v tag="$IMAGE_TAG" '
    BEGIN { in_image = 0; seen_image = 0; seen_repo = 0; seen_tag = 0 }
    {
      if ($0 ~ /^image:[[:space:]]*$/) {
        in_image = 1
        seen_image = 1
        print
        next
      }

      if (in_image == 1 && $0 ~ /^[^[:space:]]/) {
        in_image = 0
      }

      if (in_image == 1 && $0 ~ /^[[:space:]]+repository:[[:space:]]*/) {
        sub(/repository:[[:space:]]*.*/, "repository: " repo)
        seen_repo = 1
        print
        next
      }

      if (in_image == 1 && $0 ~ /^[[:space:]]+tag:[[:space:]]*/) {
        sub(/tag:[[:space:]]*.*/, "tag: " tag)
        seen_tag = 1
        print
        next
      }

      print
    }
    END {
      if (seen_image != 1 || seen_repo != 1 || seen_tag != 1) {
        exit 42
      }
    }
  ' "$VALUES_FILE" > "$TMP_FILE"

  AWK_EXIT_CODE=$?
  if [ "$AWK_EXIT_CODE" -ne 0 ]; then
    rm -f "$TMP_FILE"
    echo "Expected existing image.repository and image.tag in: $VALUES_FILE" >&2
    exit 1
  fi

  mv "$TMP_FILE" "$VALUES_FILE"
fi

echo "Updated ${VALUES_FILE}: image.repository=${IMAGE_REPOSITORY}, image.tag=${IMAGE_TAG}"
