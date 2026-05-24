# Guide de test GraphQL devant le professeur

Ce fichier explique comment tester le GraphQL de tout le projet Smart Traffic Platform avec Docker, Apollo Sandbox et des requetes GraphQL pretes a copier.

## 1. Objectif de la demonstration

Montrer que le projet utilise une architecture microservices avec une API Gateway GraphQL Federation.

La Gateway expose un seul endpoint :

```text
http://localhost:4000/graphql
```

Elle regroupe les schemas des services suivants :

```text
Auth Service          http://localhost:4001/graphql
Vehicle Service       http://localhost:4002/graphql
Traffic Service       http://localhost:4003/graphql
Incident Service      http://localhost:4004/graphql
Notification Service  http://localhost:4005/graphql
```

Pendant la demonstration, il faut tester principalement via la Gateway :

```text
http://localhost:4000/graphql
```

## 2. Demarrer le backend

Ouvrir PowerShell dans le dossier backend :

```powershell
cd C:\Users\admin\Downloads\smart-traffic-platform-complete\backend
```

Demarrer tous les conteneurs :

```powershell
docker-compose up -d
```

Verifier que tous les services sont demarres :

```powershell
docker-compose ps
```

Verifier les logs de la Gateway :

```powershell
docker-compose logs --tail=30 gateway
```

Resultat attendu :

```text
API Gateway running on http://localhost:4000
GraphQL Federation endpoint: http://localhost:4000/graphql
Services connectes:
  - Auth Service
  - Vehicle Service
  - Traffic Service
  - Incident Service
  - Notification Service
```

## 3. Tester que la Gateway repond

Dans PowerShell :

```powershell
$body = @{ query = '{ __typename }' } | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:4000/graphql -Method Post -ContentType 'application/json' -Body $body
```

Resultat attendu :

```json
{"data":{"__typename":"Query"}}
```

## 4. Ouvrir Apollo Sandbox

Ouvrir dans le navigateur :

```text
http://localhost:4000/graphql
```

Si Apollo Sandbox s'ouvre, utiliser l'URL suivante dans la barre de connexion :

```text
http://localhost:4000/graphql
```

Si Sandbox affiche `TypeError: Failed to fetch`, faire :

```text
1. Verifier que l'URL est exactement http://localhost:4000/graphql
2. Faire Ctrl + Shift + R
3. Cliquer sur refresh schema
4. Recharger les conteneurs avec docker-compose up -d gateway
```

## 5. Login administrateur

Le projet cree automatiquement un compte administrateur au demarrage du auth-service :

```text
Email:    admin@smarttraffic.tn
Password: admin123
```

Dans Apollo Sandbox, executer :

```graphql
mutation Login {
  login(input: {
    email: "admin@smarttraffic.tn"
    password: "admin123"
  }) {
    token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

Copier la valeur du champ `token`.

Ensuite, dans Apollo Sandbox, aller dans `Headers` et ajouter :

```json
{
  "Authorization": "Bearer COLLER_LE_TOKEN_ICI"
}
```

Tous les tests suivants doivent etre faits avec ce header.

## 6. Tester le service Auth

Tester l'utilisateur connecte :

```graphql
query Me {
  me {
    id
    email
    firstName
    lastName
    fullName
    role
    isActive
  }
}
```

Tester la liste des utilisateurs :

```graphql
query Users {
  users {
    id
    email
    fullName
    role
    isActive
    createdAt
  }
}
```

Tester la creation d'un utilisateur operateur :

```graphql
mutation RegisterOperator {
  register(input: {
    email: "operator.demo@smarttraffic.tn"
    password: "operator123"
    firstName: "Operator"
    lastName: "Demo"
    role: OPERATOR
  }) {
    token
    user {
      id
      email
      fullName
      role
    }
  }
}
```

## 7. Tester le service Vehicle

Creer un vehicule :

```graphql
mutation CreateVehicle {
  createVehicle(input: {
    plateNumber: "TN-2026-TEST"
    brand: "Toyota"
    model: "Corolla"
    type: CAR
    year: 2022
    color: "Blanc"
    ownerName: "Client Demo"
    ownerPhone: "+21620000000"
  }) {
    id
    plateNumber
    brand
    model
    type
    ownerName
    isActive
  }
}
```

Copier l'`id` du vehicule cree.

Lister les vehicules :

```graphql
ddddddddddddddddddddddd
```

Chercher par plaque :

```graphql
query VehicleByPlate {
  vehicleByPlate(plateNumber: "TN-2026-TEST") {
    id
    plateNumber
    brand
    model
    type
  }
}
```

Ajouter une position au vehicule :

Remplacer `VEHICLE_ID_ICI` par l'id du vehicule.

```graphql
mutation RecordPosition {
  recordPosition(input: {
    vehicleId: "VEHICLE_ID_ICI"
    latitude: 36.8065
    longitude: 10.1815
    speed: 55
    heading: 90
  }) {
    id
    vehicleId
    latitude
    longitude
    speed
    timestamp
  }
}
```

Afficher l'historique :

```graphql
query VehicleHistory {
  vehicleHistory(vehicleId: "VEHICLE_ID_ICI", limit: 10) {
    id
    latitude
    longitude
    speed
    timestamp
  }
}
```

## 8. Tester le service Traffic

Creer une zone :

```graphql
mutation CreateZone {
  createZone(input: {
    name: "Zone Demo Prof"
    description: "Zone creee pendant la demonstration"
    centerLat: 36.8065
    centerLng: 10.1815
    coordinates: [
      { lat: 36.8100, lng: 10.1800 }
      { lat: 36.8100, lng: 10.1900 }
      { lat: 36.8000, lng: 10.1900 }
      { lat: 36.8000, lng: 10.1800 }
    ]
  }) {
    id
    name
    description
    centerLat
    centerLng
    density
    vehicleCount
    averageSpeed
  }
}
```

Copier l'`id` de la zone creee.

Lister les zones :

```graphql
query Zones {
  zones {
    id
    name
    density
    vehicleCount
    averageSpeed
    isActive
  }
}
```

Mettre a jour la densite :

Remplacer `ZONE_ID_ICI` par l'id de la zone.

```graphql
mutation UpdateDensity {
  updateDensity(input: {
    zoneId: "ZONE_ID_ICI"
    vehicleCount: 80
    averageSpeed: 15
  }) {
    id
    name
    density
    vehicleCount
    averageSpeed
  }
}
```

Afficher le resume du trafic :

```graphql
query TrafficSummary {
  trafficSummary {
    totalZones
    congestedZones
    averageDensity
    zonesByDensity {
      faible
      moyen
      eleve
    }
  }
}
```

Afficher les zones congestionnees :

```graphql
query CongestedZones {
  congestedZones {
    id
    name
    density
    vehicleCount
    averageSpeed
  }
}
```

## 9. Tester le service Incident

Declarer un incident :

```graphql
mutation DeclareIncident {
  declareIncident(input: {
    type: ACCIDENT
    title: "Accident demo prof"
    description: "Incident cree pendant le test GraphQL"
    latitude: 36.8065
    longitude: 10.1815
    address: "Centre-ville Tunis"
    severity: HIGH
  }) {
    id
    type
    status
    title
    description
    severity
    reportedBy
    reportedByName
    createdAt
  }
}
```

Copier l'`id` de l'incident cree.

Lister les incidents :

```graphql
query Incidents {
  incidents {
    id
    type
    status
    title
    severity
    reportedByName
    createdAt
  }
}
```

Afficher les incidents actifs :

```graphql
query ActiveIncidents {
  activeIncidents {
    id
    title
    status
    severity
    latitude
    longitude
  }
}
```

Changer le statut de l'incident :

Remplacer `INCIDENT_ID_ICI` par l'id de l'incident.

```graphql
mutation UpdateIncidentStatus {
  updateIncidentStatus(
    id: "INCIDENT_ID_ICI"
    input: { status: EN_COURS }
  ) {
    id
    title
    status
    severity
  }
}
```

Afficher les statistiques :

```graphql
query IncidentStats {
  incidentStats {
    total
    criticalCount
    byStatus {
      signale
      enCours
      resolu
    }
    byType {
      accident
      travaux
      routeFermee
      embouteillage
    }
  }
}
```

## 10. Tester le service Notification

Lorsqu'un incident est cree ou mis a jour, le service Incident appelle le service Notification. On peut aussi creer une notification directement.

Pour envoyer une notification a l'utilisateur connecte, il faut connaitre son id. Recuperer l'id avec :

```graphql
query MeForNotification {
  me {
    id
    email
    role
  }
}
```

Remplacer `USER_ID_ICI` par l'id retourne.

```graphql
mutation SendNotification {
  sendNotification(input: {
    title: "Notification demo"
    message: "Message cree pendant la demonstration GraphQL"
    type: GENERAL
    userId: "USER_ID_ICI"
  }) {
    id
    title
    message
    type
    userId
    isRead
    createdAt
  }
}
```

Lister mes notifications :

```graphql
query MyNotifications {
  myNotifications {
    id
    title
    message
    type
    isRead
    createdAt
  }
}
```

Compter les notifications non lues :

```graphql
query UnreadCount {
  unreadCount
}
```

Afficher les statistiques de notification :

```graphql
query NotificationStats {
  notificationStats {
    total
    unread
    read
  }
}
```

Marquer toutes les notifications comme lues :

```graphql
mutation MarkAllAsRead {
  markAllAsRead
}
```

## 11. Tester que tous les schemas sont fusionnes

Cette requete montre que la Gateway connait les champs de plusieurs services dans un seul schema GraphQL.

```graphql
query GatewayFederationDemo {
  me {
    id
    email
    role
  }
  vehicles {
    id
    plateNumber
    type
  }
  zones {
    id
    name
    density
  }
  incidents {
    id
    title
    status
  }
  myNotifications {
    id
    title
    isRead
  }
}
```

Si cette requete fonctionne, cela prouve que la Gateway GraphQL Federation regroupe bien les microservices.

## 12. Tester les endpoints health

Dans PowerShell :

```powershell
Invoke-WebRequest http://localhost:4000/health
Invoke-WebRequest http://localhost:4001/health
Invoke-WebRequest http://localhost:4002/health
Invoke-WebRequest http://localhost:4003/health
Invoke-WebRequest http://localhost:4004/health
Invoke-WebRequest http://localhost:4005/health
```

Chaque service doit retourner un statut `OK`.

## 13. Commandes utiles pendant la demonstration

Voir l'etat des conteneurs :

```powershell
docker-compose ps
```

Voir les logs de la Gateway :

```powershell
docker-compose logs --tail=50 gateway
```

Voir les logs d'un service :

```powershell
docker-compose logs --tail=50 auth-service
docker-compose logs --tail=50 vehicle-service
docker-compose logs --tail=50 traffic-service
docker-compose logs --tail=50 incident-service
docker-compose logs --tail=50 notification-service
```

Redemarrer uniquement la Gateway :

```powershell
docker-compose up -d gateway
```

Redemarrer tout le backend :

```powershell
docker-compose down
docker-compose up -d
```

## 14. Ordre conseille pour presenter au professeur

1. Lancer `docker-compose ps` pour montrer les microservices.
2. Ouvrir `http://localhost:4000/graphql`.
3. Faire la mutation `Login`.
4. Ajouter le header `Authorization`.
5. Faire `query Me`.
6. Creer un vehicule.
7. Ajouter une position au vehicule.
8. Creer une zone de trafic.
9. Mettre a jour la densite de la zone.
10. Declarer un incident.
11. Voir les notifications.
12. Executer `GatewayFederationDemo` pour montrer que tout passe par un seul endpoint.

## 15. Phrase simple a dire au professeur

```text
Notre backend est compose de plusieurs microservices GraphQL. Chaque service possede son propre schema, sa propre base de donnees et son propre endpoint. La Gateway Apollo Federation interroge tous les subgraphs et expose un seul endpoint public: http://localhost:4000/graphql. Toutes les requetes de test passent par cet endpoint, ce qui prouve que les schemas sont bien federes.
```

