{{- define "policy-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "policy-service.fullname" -}}
{{- default .Values.app.name .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "policy-service.namespace" -}}
{{- default .Release.Namespace .Values.namespace.name -}}
{{- end -}}

{{- define "policy-service.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.app.name }}
{{- end -}}

{{- define "policy-service.labels" -}}
{{ include "policy-service.selectorLabels" . }}
app.kubernetes.io/component: {{ .Values.global.component }}
app.kubernetes.io/part-of: {{ .Values.global.partOf }}
{{- end -}}

{{- define "policy-service.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "policy-service.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}
