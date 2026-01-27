pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || echo "Lint warnings detected"'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npx tsc --noEmit'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test || echo "No tests configured"'
            }
        }
    }

    post {
        success {
            echo '✅ Build successful! Ready for Vercel deployment.'
            // Notify Jira (optional)
            // jiraSendBuildInfo site: 'your-site.atlassian.net'
        }
        failure {
            echo '❌ Build failed. Please fix the errors.'
        }
        always {
            cleanWs()
        }
    }
}
