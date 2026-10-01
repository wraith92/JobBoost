# ============================================================
# TEST API FRANCE TRAVAIL
# Récupère jusqu'à 3 offres "développeur" publiées depuis 1 jour
# ============================================================

# ------------------------------------------------------------
# 1. IDENTIFIANTS FRANCE TRAVAIL
# Remplace uniquement les deux valeurs ci-dessous
# ------------------------------------------------------------

$clientId = "TON_CLIENT_ID_ICI"
$clientSecret = "TON_CLIENT_SECRET_ICI"

# ------------------------------------------------------------
# 2. RECUPERATION DU TOKEN OAUTH2
# ------------------------------------------------------------

$tokenBody = @{
    grant_type    = "client_credentials"
    client_id     = "PAR_jobboost_24af7510bfb950c9a78524cc36d8e3ed72e76278631c2d1a0a6c4774a30e8871"
    client_secret = "a0ddae5f2fdcd90544b370108dd171e8512bc076780a395b4228869ed4ebc48f"
    scope         = "api_offresdemploiv2 o2dsoffre"
}

try {
    $token = Invoke-RestMethod `
        -Method POST `
        -Uri "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire" `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $tokenBody
}
catch {
    Write-Host ""
    Write-Host "Erreur lors de l'authentification France Travail" -ForegroundColor Red
    Write-Host $_
    exit 1
}

Write-Host ""
Write-Host "Token France Travail obtenu" -ForegroundColor Green
Write-Host ""

# ------------------------------------------------------------
# 3. HEADERS API
# ------------------------------------------------------------

$headers = @{
    Authorization = "Bearer $($token.access_token)"
    Accept        = "application/json"
}

# ------------------------------------------------------------
# 4. PARAMETRES DE RECHERCHE
# Tu peux modifier le mot-clé ici
# ------------------------------------------------------------

$keyword = "développeur"

$encodedKeyword = [uri]::EscapeDataString($keyword)

# range=0-2 => maximum 3 offres
# publieeDepuis=1 => offres publiées depuis 1 jour

$uri = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?motsCles=$encodedKeyword&publieeDepuis=1&range=0-2"

# ------------------------------------------------------------
# 5. APPEL API
# ------------------------------------------------------------

try {
    $response = Invoke-RestMethod `
        -Method GET `
        -Uri $uri `
        -Headers $headers

    $jobs = $response.resultats

    Write-Host ""
    Write-Host "Nombre d'offres récupérées : $($jobs.Count)" -ForegroundColor Cyan
    Write-Host ""

    $jobs | Select-Object `
        id,
        intitule,
        @{Name="Entreprise";Expression={$_.entreprise.nom}},
        @{Name="Lieu";Expression={$_.lieuTravail.libelle}},
        typeContratLibelle,
        dateCreation |
    Format-Table -AutoSize
}
catch {
    Write-Host ""
    Write-Host "Erreur API France Travail" -ForegroundColor Red
    Write-Host $_
    exit 1
}

# ------------------------------------------------------------
# 6. OPTIONNEL : AFFICHER LA PREMIERE OFFRE EN JSON
# Décommente les 2 lignes ci-dessous si besoin
# ------------------------------------------------------------

# Write-Host ""
# $jobs[0] | ConvertTo-Json -Depth 10
