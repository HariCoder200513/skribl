# Jenkins Setup on AWS EC2 (ap-southeast-2)

This guide walks through setting up Jenkins on an EC2 instance in the new AWS experience (single region: ap-southeast-2). We'll use it to automate building and deploying the Skribl backend to AWS Lambda.

## 1) Prerequisites
- AWS account in new AWS experience (ap-southeast-2)
- EC2 instance already created (Ubuntu 22.04 LTS recommended)
- Key pair to SSH
- Security group rules ready
- Jenkins IAM user credentials for Lambda deployments

## 2) Connect to EC2
Replace values with your own.

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

## 3) Update system
```bash
sudo apt update && sudo apt upgrade -y
```

## 4) Install Java 21 (required for Jenkins)
```bash
sudo apt install -y openjdk-21-jdk
java -version
```

## 5) Install Jenkins
```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins
```

## 6) Install dependencies for builds
We need Git, Maven, Docker (optional), unzip, zip, curl, and AWS CLI.

```bash
sudo apt install -y git maven unzip zip curl
```

### Install AWS CLI v2
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

### Add Jenkins to groups (if using Docker later)
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## 7) Open Jenkins in browser
Jenkins runs on port 8080. Open Security Group for EC2 and allow TCP 8080 from your IP (or 0.0.0.0/0 only if temporary).

Go to:
```text
http://<EC2_PUBLIC_IP>:8080
```

## 8) Unlock Jenkins
Get initial admin password:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Paste it in the browser.

## 9) Install suggested plugins
Choose "Install suggested plugins". Wait for them to finish.

Create first admin user (username/password/email).

## 10) Configure tools

Go to **Manage Jenkins → Tools**

### JDK
Add JDK 21 (name: `jdk21`). Can use JAVA_HOME `/usr/lib/jvm/java-21-openjdk-amd64` or let Jenkins auto-install.

### Maven
Add Maven (name: `maven3`). Install from Apache (latest 3.9.x).

### Git
Usually pre-installed. Verify.

## 11) Add AWS credentials to Jenkins
We need AWS credentials to call Lambda.

Go to **Manage Jenkins → Credentials → System → Global credentials (unrestricted) → Add Credentials**

Kind: `AWS Credentials`
ID: `aws-jenkins-creds`
Access Key ID: `<your-jenkins-iam-access-key>`
Secret Access Key: `<your-jenkins-iam-secret-key>`
Description: AWS creds for Lambda deploy

Save.

## 12) Create pipeline for Lambda deployment
Go to **New Item → Pipeline → Name: skribl-backend-lambda-deploy**

Under **Pipeline**:
- Definition: `Pipeline script from SCM`
- SCM: `Git`
- Repository URL: `https://github.com/<your-username>/<your-repo>.git` (or SSH)
- Branch Specifier: `*/main`
- Script Path: `backend/Jenkinsfile.lambda`

Save.

## 13) Test deployment
Click **Build Now**. Watch logs in **Console Output**.

It will:
- checkout
- mvn test
- mvn package
- zip JAR
- aws lambda update-function-code

If successful, Lambda will be updated with new code.

## 14) Test Lambda endpoint
```bash
curl -i https://<your-lambda-function-url>.lambda-url.ap-southeast-2.on.aws/api/auth/me
```

Should return `HTTP/1.1 403` (unauthenticated protected endpoint)

## Security notes
- Restrict port 8080 to your IP only
- Use IAM user with least privilege (only Lambda update)
- Consider using AWS Systems Manager Session Manager instead of SSH
- For new AWS experience, stay in ap-southeast-2
- Don't commit AWS keys
- Use HTTPS for Jenkins if exposed (or use Cloudflare Tunnel)

## Troubleshooting
- **Permission denied on docker**: add jenkins to docker group
- **aws not found**: ensure AWS CLI in PATH for jenkins user
- **zip not found**: install `zip` package
- **JAR too big**: upload via S3 if >50MB
- **Cold starts**: normal with Spring Boot on Lambda
