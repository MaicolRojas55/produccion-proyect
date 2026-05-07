# Kubernetes para CONIITI

Este directorio implementa una arquitectura Kubernetes equivalente a `docker-compose.yml`, separando servicios stateless y stateful, con persistencia y punto unico de entrada.

## 1) Arquitectura propuesta

- **Capa de entrada**
  - `Ingress` (`coniiti-ingress`) con host `coniiti.local`.
  - Ruta `/` hacia `frontend`.
  - Ruta `/api` hacia `gateway` (Nginx), que mantiene la misma logica de ruteo del proyecto actual.

- **Capa de aplicaciones (stateless)**
  - `Deployment` + `Service` para:
    - `frontend`
    - `gateway`
    - `users-service`
    - `conferences-service`
    - `backend` (legacy fallback)
    - `notification-service`
  - Se usan `readinessProbe` y `livenessProbe` para autorecuperacion y despliegues mas seguros.
  - `users-service`, `conferences-service`, `backend` y `gateway` con replicas > 1 para alta disponibilidad basica.

- **Capa de datos y mensajeria (stateful)**
  - `StatefulSet` + `PVC` para:
    - `users-mongo`
    - `conferences-mongo`
    - `mongo` (legacy)
    - `rabbitmq`
  - `notification-service` persiste SQLite en `notifications-data-pvc`.

## 2) Justificacion tecnica

- **Separar stateless/stateful** permite escalar APIs sin tocar bases y conservar datos ante reinicios.
- **RabbitMQ stateful con volumen** evita perdida de mensajes durables.
- **Gateway Nginx interno** conserva compatibilidad con tu enrutamiento actual y evita refactor del front.
- **Ingress como entrada unica** simplifica exposicion externa, TLS futuro y politicas de acceso.
- **ConfigMap + Secret** desacopla configuracion de imagenes y protege secretos (`JWT`, credenciales RabbitMQ).

## 3) Archivos incluidos

- `namespace.yaml`: namespace `coniiti`.
- `configmap.yaml`: variables no sensibles + configuracion Nginx del gateway.
- `secret.example.yaml`: plantilla de secretos (debes cambiar valores).
- `stateful-services.yaml`: MongoDBs y RabbitMQ con persistencia.
- `apps.yaml`: Deployments/Services de frontend y microservicios.
- `ingress.yaml`: reglas HTTP para `coniiti.local`.
- `kustomization.yaml`: despliegue integral.

## 4) Requisitos previos

- Cluster Kubernetes disponible (minikube, kind, k3d, EKS, GKE, AKS, etc.).
- Ingress Controller NGINX instalado.
- Imagenes construidas y disponibles para el cluster.

## 5) Construir y publicar imagenes

Desde la raiz del proyecto:

```bash
docker build -t produccion-proyect/front-end:latest ./front-end
docker build -t produccion-proyect/back-end:latest ./back-end
docker build -t produccion-proyect/users-service:latest ./users-service
docker build -t produccion-proyect/conferences-service:latest ./conferences-service
docker build -t produccion-proyect/notification-service:latest ./notification-service
```

Si usas minikube, puedes usar el daemon local:

```bash
eval $(minikube docker-env)
```

Si usas registro remoto, etiqueta y sube imagenes, luego ajusta `image:` en `apps.yaml`.

## 6) Despliegue

1. Ajusta secretos:
   - Copia `secret.example.yaml` a `secret.yaml`.
   - Cambia `JWT_SECRET_KEY`, `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`.
2. En `kustomization.yaml`, reemplaza `secret.example.yaml` por `secret.yaml`.
3. Aplica manifiestos:

```bash
kubectl apply -k k8s/
```

4. Verifica estado:

```bash
kubectl get pods -n coniiti
kubectl get svc -n coniiti
kubectl get ingress -n coniiti
```

## 7) Inicializacion de datos legacy (opcional)

Para poblar usuarios base del backend legacy:

```bash
kubectl exec -n coniiti deploy/backend -- python init_db.py
```

## 8) Guia de funcionamiento

Flujo esperado:

1. Usuario accede por `http://coniiti.local/` (frontend).
2. Front consume `/api/*` en el mismo host.
3. Ingress enruta `/api` al gateway Nginx.
4. Nginx enruta por prefijo:
   - `auth/users` -> `users-service`
   - `conferences/student-agenda` -> `conferences-service`
   - `notifications` -> `notification-service`
   - resto -> `backend`
5. Eventos de negocio via RabbitMQ:
   - `users-service` y `conferences-service` publican.
   - `notification-service` consume y persiste procesados.

## 9) Pruebas recomendadas

### Prueba A - Salud de servicios

```bash
kubectl port-forward -n coniiti svc/gateway 8080:80
curl http://localhost:8080/api/notifications/health
curl http://localhost:8080/api/auth/me
```

### Prueba B - Registro y evento

```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Test User\",\"email\":\"testuser@example.com\",\"password\":\"Test12345!\",\"role\":\"usuario_registrado\"}"
```

Luego valida consumo:

```bash
kubectl port-forward -n coniiti svc/notification-service 8002:8002
curl http://localhost:8002/metrics
```

### Prueba C - Resiliencia asincrona

1. Deten temporalmente notificaciones:

```bash
kubectl scale deploy/notification-service -n coniiti --replicas=0
```

2. Genera eventos (registro o creacion de conferencia).
3. Reactiva notificaciones:

```bash
kubectl scale deploy/notification-service -n coniiti --replicas=1
```

4. Confirma que `processed_events_total` aumenta y revisa logs:

```bash
kubectl logs -n coniiti deploy/notification-service --tail=200
```
