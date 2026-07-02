resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}"
  location = var.location
  tags     = var.tags
}

resource "azurerm_static_web_app" "site" {
  name                = "swa-${var.project_name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = var.tags
}

# --- Asset Storage (Blob) ---
# Optional offload target for large media (the site currently serves
# /shared-assets/ from the SWA itself, which fits the Free tier's 250 MB cap).
# Populate with scripts/sync-assets.sh when you want to move media to blob.

resource "azurerm_storage_account" "assets" {
  name                     = "${var.project_name}assets"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  min_tls_version          = "TLS1_2"

  blob_properties {
    cors_rule {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "HEAD", "OPTIONS"]
      allowed_origins = [
        "https://${var.primary_domain}",
        "https://www.${var.primary_domain}",
      ]
      exposed_headers    = ["Content-Length", "Content-Type"]
      max_age_in_seconds = 86400
    }
  }

  tags = var.tags
}

resource "azurerm_storage_account_static_website" "assets" {
  storage_account_id = azurerm_storage_account.assets.id
  index_document     = "index.html"
  error_404_document = "404.html"
}

# --- Custom domains ---
# fpsf.dev is the canonical domain (apex + www), which is exactly 2 custom
# domains and fits the SWA Free tier. The second domain,
# var.secondary_domain (freepresssummerfest.dev), is NOT bound here — it is
# 301-redirected to fpsf.dev at the registrar / DNS provider (URL forwarding),
# so it never needs to hit this Static Web App.

resource "azurerm_static_web_app_custom_domain" "apex" {
  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = var.primary_domain
  validation_type   = "dns-txt-token"
}

resource "azurerm_static_web_app_custom_domain" "www" {
  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = "www.${var.primary_domain}"
  validation_type   = "cname-delegation"
}
