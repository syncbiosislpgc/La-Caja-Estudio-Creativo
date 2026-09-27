variable "tenancy_ocid" { type = string }
variable "user_ocid" { type = string }
variable "fingerprint" { type = string }
variable "private_key_path" { type = string }
variable "region" {
  type    = string
  default = "eu-frankfurt-1"
}
variable "compartment_ocid" { type = string }

variable "ssh_public_key" { type = string }
variable "ssh_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "Restrict to your IP/32 when possible"
}

variable "instance_name" {
  type    = string
  default = "cp-lab-k3s"
}
variable "instance_shape" {
  type    = string
  default = "VM.Standard.A1.Flex"
}
variable "instance_ocpus" {
  type        = number
  default     = 2
  description = "Always Free Ampere total is typically 2 OCPU — do not exceed without approval"
}
variable "instance_memory_gb" {
  type    = number
  default = 12
}
variable "boot_volume_gb" {
  type        = number
  default     = 50
  description = "Keep within Always Free block volume pool (~200 GB)"
}

variable "bootstrap_repo_url" {
  type        = string
  default     = "https://github.com/syncbiosislpgc/La-Caja-Estudio-Creativo.git"
  description = "Public repo used by cloud-init to fetch scripts (or private with deploy key)"
}
