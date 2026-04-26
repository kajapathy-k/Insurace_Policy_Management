# Helm Charts for Insurance Microservices

This folder contains independent Helm charts converted from the existing working Kubernetes manifests in k8s.

## Chart Mapping

- helm/api-gateway <- k8s/api-gateway and shared top-level k8s resources:
  - k8s/namespace.yaml
  - k8s/gateway.yaml
  - k8s/httproute.yaml
- helm/user-service <- k8s/user-service
- helm/policy-service <- k8s/policy-service
- helm/claims-service <- k8s/claims-service
- helm/payment-service <- k8s/payment-service
- helm/frontend <- k8s/frontend
- helm/mysql <- k8s/mysql

Each chart includes:

- Chart.yaml
- values-dev.yaml
- values-prod.yaml
- templates/_helpers.tpl
- templates/NOTES.txt
- Helm templates converted from the corresponding existing k8s YAML manifests

## Dev Install Commands

```bash
helm upgrade --install api-gateway ./helm/api-gateway -f ./helm/api-gateway/values-dev.yaml
helm upgrade --install user-service ./helm/user-service -f ./helm/user-service/values-dev.yaml
helm upgrade --install policy-service ./helm/policy-service -f ./helm/policy-service/values-dev.yaml
helm upgrade --install claims-service ./helm/claims-service -f ./helm/claims-service/values-dev.yaml
helm upgrade --install payment-service ./helm/payment-service -f ./helm/payment-service/values-dev.yaml
helm upgrade --install frontend ./helm/frontend -f ./helm/frontend/values-dev.yaml
helm upgrade --install mysql ./helm/mysql -f ./helm/mysql/values-dev.yaml
```

## Prod Install Commands

```bash
helm upgrade --install api-gateway ./helm/api-gateway -f ./helm/api-gateway/values-prod.yaml
helm upgrade --install user-service ./helm/user-service -f ./helm/user-service/values-prod.yaml
helm upgrade --install policy-service ./helm/policy-service -f ./helm/policy-service/values-prod.yaml
helm upgrade --install claims-service ./helm/claims-service -f ./helm/claims-service/values-prod.yaml
helm upgrade --install payment-service ./helm/payment-service -f ./helm/payment-service/values-prod.yaml
helm upgrade --install frontend ./helm/frontend -f ./helm/frontend/values-prod.yaml
helm upgrade --install mysql ./helm/mysql -f ./helm/mysql/values-prod.yaml
```

## Upgrade Examples

```bash
helm upgrade api-gateway ./helm/api-gateway -f ./helm/api-gateway/values-dev.yaml
helm upgrade mysql ./helm/mysql -f ./helm/mysql/values-prod.yaml
```
