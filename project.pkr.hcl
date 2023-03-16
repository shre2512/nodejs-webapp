packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

locals {
  timestamp = regex_replace(timestamp(), "[- TZ:]", "")
}

source "amazon-ebs" "webApp" {
  ami_users = [645109436020,620170578969]
  ami_name = "webApp-${local.timestamp}"

  source_ami_filter {
    filters = {
      name                = "amzn2-ami-hvm-2.*.1-x86_64-gp2"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }


  instance_type = "t2.micro"
  region        = "us-east-1"
  ssh_username  = "ec2-user"
}

build {
  sources = [
    "source.amazon-ebs.webApp"
  ]

  provisioner "file" {
    source      = "./webApp.zip"
    destination = "~/webApp.zip"
  }

  provisioner "file" {
    source      = "./project.service"
    destination = "/tmp/project.service"
  }

  provisioner "shell" {
    script = "./app.sh"
  }
}

