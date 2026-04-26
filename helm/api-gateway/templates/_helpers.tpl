{{- define "api-gateway.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "api-gateway.fullname" -}}
{{- default .Values.app.name .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "api-gateway.namespace" -}}
{{- default .Release.Namespace .Values.namespace.name -}}
{{- end -}}

{{- define "api-gateway.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.app.name }}
{{- end -}}

{{- define "api-gateway.labels" -}}
{{ include "api-gateway.selectorLabels" . }}
app.kubernetes.io/component: {{ .Values.global.component }}
app.kubernetes.io/part-of: {{ .Values.global.partOf }}
{{- end -}}

{{- define "api-gateway.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "api-gateway.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}
