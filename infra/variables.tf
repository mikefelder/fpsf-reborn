variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "centralus"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "fpsf"
}

variable "primary_domain" {
  description = "Primary (canonical) custom domain for the static site"
  type        = string
  default     = "fpsf.dev"
}

variable "secondary_domain" {
  description = "Secondary domain that 301-redirects to primary_domain at the registrar (not bound to the SWA)"
  type        = string
  default     = "freepresssummerfest.dev"
}

variable "tags" {
  description = "Tags applied to all resources"
  type        = map(string)
  default = {
    project     = "fpsf"
    environment = "production"
    managed_by  = "terraform"
  }
}
