{{- define "claims-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "claims-service.fullname" -}}
{{- default .Values.app.name .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "claims-service.namespace" -}}
{{- default .Release.Namespace .Values.namespace.name -}}
{{- end -}}

{{- define "claims-service.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.app.name }}
{{- end -}}

{{- define "claims-service.labels" -}}
{{ include "claims-service.selectorLabels" . }}
app.kubernetes.io/component: {{ .Values.global.component }}
app.kubernetes.io/part-of: {{ .Values.global.partOf }}
{{- end -}}

{{- define "claims-service.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "claims-service.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}
