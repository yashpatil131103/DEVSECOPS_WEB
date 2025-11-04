pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "react_frontend"
        BACKEND_IMAGE  = "node_backend"
        SONAR_AUTH_TOKEN = credentials('SONAR_AUTH_TOKEN')
        SONAR_URL = "http://3.110.205.36/:9000"   // 👉 Use EC2 IP if SonarQube not in Docker
    }

    stages {

        /* -------------------------
         🧱 Stage 1: Git Clone
        ------------------------- */
        stage('Git Clone') {
            steps {
                echo "📦 Cloning repository..."
                git url: 'https://github.com/yashpatil131103/DEVSECOPS_WEB.git', branch: 'main'
            }
        }

        /* -------------------------
         🧹 Stage 2: Cleanup Old Containers & Images
        ------------------------- */
        stage('Cleanup Old Containers & Images') {
            steps {
                echo "🧹 Cleaning up old containers and images if they exist..."
                sh '''
                echo "Stopping and removing old containers..."
                docker ps -a --filter "name=${FRONTEND_IMAGE}" --format "{{.ID}}" | xargs -r docker stop
                docker ps -a --filter "name=${BACKEND_IMAGE}"  --format "{{.ID}}" | xargs -r docker stop
                docker ps -a --filter "name=${FRONTEND_IMAGE}" --format "{{.ID}}" | xargs -r docker rm
                docker ps -a --filter "name=${BACKEND_IMAGE}"  --format "{{.ID}}" | xargs -r docker rm

                echo "Removing old images..."
                docker images -q ${FRONTEND_IMAGE} | xargs -r docker rmi -f
                docker images -q ${BACKEND_IMAGE}  | xargs -r docker rmi -f
                '''
            }
        }

        /* -------------------------
         ⚙️ Stage 3: Build Docker Images
        ------------------------- */
        stage('Build Docker Images') {
            steps {
                echo "⚙️ Building new Docker images using docker-compose..."
                sh '''
                docker-compose down --rmi all || true
                docker-compose build --no-cache
                '''
            }
        }

        /* -------------------------
         🔍 Stage 4: SonarQube Scan (No Quality Gate)
        ------------------------- */
        stage('SonarQube Scan') {
            steps {
                script {
                    echo "🔍 Running SonarQube static code analysis..."
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('MySonarQube') {
                        sh """
                        export PATH=$PATH:/usr/bin
                        node -v
                        ${scannerHome}/bin/sonar-scanner \
                          -Dproject.settings=sonar-project.properties \
                          -Dsonar.host.url=${SONAR_URL} \
                          -Dsonar.login=$SONAR_AUTH_TOKEN
                        """
                    }
                }
            }
        }

        /* -------------------------
         🧠 Stage 5: NPM Audit (Dependency Scan)
        ------------------------- */
        stage('NPM Audit Scan') {
            steps {
                echo "📦 Running npm audit on frontend and backend..."
                sh '''
                cd frontend
                npm install --legacy-peer-deps || true
                npm audit --audit-level=high || true

                cd ../backend
                npm install --legacy-peer-deps || true
                npm audit --audit-level=high || true
                '''
            }
        }

        /* -------------------------
         🧰 Stage 6: Trivy Image Scan
        ------------------------- */
        stage('Trivy Image Scan') {
            steps {
                echo "🔎 Scanning Docker images for vulnerabilities using Trivy..."
                sh '''
                echo "Scanning Frontend image..."
                trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE} || true

                echo "Scanning Backend image..."
                trivy image --severity HIGH,CRITICAL ${BACKEND_IMAGE} || true
                '''
            }
        }

        /* -------------------------
         🚀 Stage 7: Run Containers
        ------------------------- */
        stage('Run Containers') {
            steps {
                echo "🚀 Running new containers..."
                sh '''
                docker-compose up -d
                docker ps
                '''
            }
        }

        /* -------------------------
         ✅ Stage 8: Verify Deployment
        ------------------------- */
        stage('Verify Deployment') {
            steps {
                echo "✅ Checking container status..."
                sh '''
                docker ps | grep ${FRONTEND_IMAGE} && echo "✅ Frontend container is running!" || echo "❌ Frontend not found!"
                docker ps | grep ${BACKEND_IMAGE}  && echo "✅ Backend container is running!" || echo "❌ Backend not found!"
                '''
            }
        }
    }

    /* -------------------------
       📦 Post-build Summary
    ------------------------- */
    post {
        always {
            echo "🏁 Pipeline finished — cleaning workspace..."
        }
        success {
            echo "✅ DevSecOps pipeline executed successfully! 🚀"
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs for errors."
        }
    }
}
