/*
  Oracle Cloud Always Free — Ampere A1 VM for Control Plane cloud lab.

  Limits (2026): typically 2 OCPU + 12 GB RAM total for Ampere Always Free.
  Do NOT create shapes above free limits without approval.

  Required variables: see variables.tf / terraform.tfvars.example
  Credentials: OCI CLI config or env (TF_VAR_ / OCI_*). NEVER commit keys.
*/

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 5.0.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

resource "oci_core_vcn" "lab" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = ["10.42.0.0/16"]
  display_name   = "cp-lab-vcn"
  dns_label      = "cplab"
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.lab.id
  display_name   = "cp-lab-igw"
  enabled        = true
}

resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.lab.id
  display_name   = "cp-lab-rt"
  route_rules {
    network_entity_id = oci_core_internet_gateway.igw.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
  }
}

resource "oci_core_security_list" "lab" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.lab.id
  display_name   = "cp-lab-sl"

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }

  # SSH only (for bootstrap). Prefer Tailscale later and lock this down.
  ingress_security_rules {
    protocol = "6"
    source   = var.ssh_cidr
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Intentionally NO 6443. Cloudflare Tunnel uses outbound connections.
}

resource "oci_core_subnet" "public" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.lab.id
  cidr_block        = "10.42.1.0/24"
  display_name      = "cp-lab-subnet"
  route_table_id    = oci_core_route_table.public.id
  security_list_ids = [oci_core_security_list.lab.id]
  dns_label         = "cplabsub"
}

data "oci_core_images" "ubuntu_arm" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = var.instance_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_instance" "lab" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  display_name        = var.instance_name
  shape               = var.instance_shape

  shape_config {
    ocpus         = var.instance_ocpus
    memory_in_gbs = var.instance_memory_gb
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public.id
    assign_public_ip = true
    display_name     = "cp-lab-vnic"
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = var.boot_volume_gb
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init.yaml.tftpl", {
      repo_url = var.bootstrap_repo_url
    }))
  }

  freeform_tags = {
    project = "control-plane-lab"
    cost    = "always-free"
  }
}

output "public_ip" {
  value = oci_core_instance.lab.public_ip
}

output "instance_id" {
  value = oci_core_instance.lab.id
}

output "ssh_hint" {
  value = "ssh ubuntu@${oci_core_instance.lab.public_ip}"
}
