import type { CareerTrack } from '../types';

// This file contains the TRACKS data objects.
export const TRACKS: CareerTrack[] = [
  {
    id: 'python-production-engineer',
    title: 'Become a Python Production Engineer',
    description: 'Master the complete Python ecosystem for production environments.',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    level: 'Advanced',
    tags: ['Career Track', 'Top Rated'],
    outcomeStatement: 'Master Python from base syntax to production-grade services, testing structures, database integrations, and automated pipelines.',
    estimatedTime: '36 hours + 2 in-person sessions',
    coursesCount: 6,
    progress: 38,
    enrolled: true,
    selfAssessmentOptions: ['I Know Nothing', 'I Know Basics', 'I Have Experience'],
    milestones: [
      { id: 'py-mile-1', title: 'Python Basics', description: 'Core syntax.', courses: [{ id: 'python-bootcamp' }, { id: 'test-course', isOptional: true }], status: 'active' },
      { id: 'py-mile-2', title: 'Version Control', description: 'Git essentials.', courses: [{ id: 'git-version-control' }, { id: 'git-essentials' }], status: 'locked' },
      { id: 'py-mile-3', title: 'Advanced Python', description: 'Metaprogramming.', courses: [{ id: 'advanced-python' }, { id: 'fastapi-backend' }, { id: 'apache-spark-basics' }], status: 'locked' },
      { id: 'py-mile-4', title: 'Data Stack', description: 'Web APIs & DBs.', courses: [{ id: 'snowflake-data-warehouse' }], status: 'locked' },
      { id: 'py-mile-5', title: 'Containerization', description: 'Dockerizing apps.', courses: [{ id: 'linux-administration' }, { id: 'kubernetes-for-beginners' }], status: 'locked' },
      { id: 'py-mile-6', title: 'CI/CD for Python', description: 'GitHub Actions.', courses: [{ id: 'ansible-configuration' }, { id: 'monitoring-prometheus' }, { id: 'kubernetes-advanced', isOptional: true }], status: 'locked' }
    ]
  },
  {
    id: 'cloud-devops-engineer',
    title: 'Become a Cloud & DevOps Engineer',
    description: 'Go from zero to production-ready infrastructure. Master containerisation, CI/CD automation, and cloud platform deployments used by modern engineering teams.',
    imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    level: 'Intermediate',
    tags: ['Career Track', 'New'],
    outcomeStatement: 'Design and operate cloud-native infrastructure pipelines using Docker, Kubernetes, Terraform, and GitHub Actions on AWS or Azure.',
    estimatedTime: '42 hours + 3 in-person sessions',
    coursesCount: 11,
    enrolled: false,
    progress: 0,
    selfAssessmentOptions: ['Pure Beginner', 'Some IT Background', 'Junior Dev'],
    milestones: [
      { id: 'devops-mile-1', title: 'Prerequisites: Command Line', description: 'Bash scripting and terminal usage.', courses: [{ id: 'command-line-basics' }, { id: 'git-essentials', isOptional: true }], status: 'active' },
      { id: 'devops-mile-2', title: 'Prerequisites: Version Control', description: 'Source code management.', courses: [{ id: 'git-version-control' }], status: 'locked' },
      { id: 'devops-mile-3', title: 'Linux Administration', description: 'System administration basics.', courses: [{ id: 'linux-administration' }, { id: 'apache-spark-basics', isOptional: true }], status: 'locked' },
      { id: 'devops-mile-4', title: 'Networking', description: 'TCP/IP and routing.', courses: [{ id: 'networking-fundamentals' }], status: 'locked' },
      { id: 'devops-mile-5', title: 'Containerization', description: 'Docker basics.', courses: [{ id: 'docker-containers' }, { id: 'kubernetes-for-beginners', isOptional: true }], status: 'locked' },
      { id: 'devops-mile-6', title: 'Kubernetes Foundations', description: 'Intro to K8s.', courses: [{ id: 'kubernetes-for-beginners' }], status: 'locked' },
      { id: 'devops-mile-7', title: 'Advanced Kubernetes', description: 'Deep dive into K8s.', courses: [{ id: 'kubernetes-advanced' }], status: 'locked' },
      { id: 'devops-mile-8', title: 'CI/CD Automation', description: 'Automating builds.', courses: [{ id: 'github-actions-automation' }], status: 'locked' },
      { id: 'devops-mile-9', title: 'Infrastructure as Code', description: 'Terraform fundamentals.', courses: [{ id: 'terraform-iac-fundamentals' }], status: 'locked' },
      { id: 'devops-mile-10', title: 'Configuration Management', description: 'Ansible.', courses: [{ id: 'ansible-configuration' }], status: 'locked' },
      { id: 'devops-mile-11', title: 'Monitoring & Observability', description: 'Prometheus & Grafana.', courses: [{ id: 'monitoring-prometheus' }], status: 'locked' }
    ]
  },
  {
    id: 'data-engineering-python-sql',
    title: 'Data Engineering with Python & SQL',
    description: 'Build robust data pipelines, warehouses, and transformation workflows. A hands-on track for engineers who want to work in the data stack.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    level: 'Intermediate',
    tags: ['Career Track', 'Intensive'],
    outcomeStatement: 'Design ETL pipelines, model relational data warehouses, and deliver analytics-ready datasets using Python, SQL, dbt, and Apache Airflow.',
    estimatedTime: '38 hours + 2 in-person sessions',
    coursesCount: 6,
    progress: 0,
    enrolled: false,
    selfAssessmentOptions: ['New to Data', 'SQL User', 'Python Programmer'],
    milestones: [
      { id: 'data-mile-1', title: 'SQL & Databases', description: 'Relational data.', courses: [{ id: 'sql-databases' }], status: 'active' },
      { id: 'data-mile-2', title: 'Python for Data', description: 'Pandas & processing.', courses: [{ id: 'python-data-processing' }], status: 'locked' },
      { id: 'data-mile-3', title: 'Big Data Processing', description: 'Spark and Hadoop.', courses: [{ id: 'apache-spark-basics' }], status: 'locked' },
      { id: 'data-mile-4', title: 'Cloud Data Warehouse', description: 'Snowflake.', courses: [{ id: 'snowflake-data-warehouse' }], status: 'locked' },
      { id: 'data-mile-5', title: 'ETL Orchestration', description: 'Airflow basics.', courses: [{ id: 'airflow-etl-automation' }], status: 'locked' }
    ]
  }
];
