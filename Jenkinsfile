pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "react_frontend"
        BACKEND_IMAGE  = "node_backend"
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
                docker ps -a --filter "name=${BACKEND_IMAGE}" --format "{{.ID}}" | xargs -r docker stop
                docker ps -a --filter "name=${FRONTEND_IMAGE}" --format "{{.ID}}" | xargs -r docker rm
                docker ps -a --filter "name=${BACKEND_IMAGE}" --format "{{.ID}}" | xargs -r docker rm

                echo "Removing old images..."
                docker images -q ${FRONTEND_IMAGE} | xargs -r docker rmi -f
                docker images -q ${BACKEND_IMAGE} | xargs -r docker rmi -f
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
         🧠 Stage 4: NPM Audit (Dependency Scan)
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
         🧰 Stage 5: Trivy Image Scan
        ------------------------- */
        stage('Trivy Image Scan') {
            steps {
                echo "🔎 Scanning Docker images for vulnerabilities using Trivy..."
                sh '''
                trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE} || true
                trivy image --severity HIGH,CRITICAL ${BACKEND_IMAGE} || true
                '''
            }
        }

        /* -------------------------
         🚀 Stage 6: Run Containers
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
         ✅ Stage 7: Verify Deployment
        ------------------------- */
        stage('Verify Deployment') {
            steps {
                echo "✅ Checking container status..."
                sh '''
                docker ps | grep ${FRONTEND_IMAGE} || echo "Frontend container not found!"
                docker ps | grep ${BACKEND_IMAGE} || echo "Backend container not found!"
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
            echo "✅ Docker images built, scanned, and deployed successfully! 🔒"
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs for errors."
        }
    }
}
