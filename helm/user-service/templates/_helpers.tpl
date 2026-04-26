{{- define "user-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "user-service.fullname" -}}
{{- default .Values.app.name .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "user-service.namespace" -}}
{{- default .Release.Namespace .Values.namespace.name -}}
{{- end -}}

{{- define "user-service.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.app.name }}
{{- end -}}

{{- define "user-service.labels" -}}
{{ include "user-service.selectorLabels" . }}
app.kubernetes.io/component: {{ .Values.global.component }}
app.kubernetes.io/part-of: {{ .Values.global.partOf }}
{{- end -}}

{{- define "user-service.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "user-service.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}
