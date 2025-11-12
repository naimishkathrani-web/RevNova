#!/usr/bin/env python3
"""
Complete Week 5 implementation guides for Dev2 and Dev3.
This script adds comprehensive content with enhanced Copilot prompts to all remaining Week 5 files.
"""

from pathlib import Path
import re

# Dev2 Day 22-25 summaries
DEV2_SUMMARIES = {
    'day22': {
        'title': 'Real-time Updates',
        'copilot': '''<strong>Day 22 - RevNova Frontend - Real-time Updates</strong>

<strong>🎯 REVNOVA:</strong> WebSocket/Server-Sent Events for live migration progress updates
<strong>📚 REQUIREMENTS:</strong> <a href="../RevNovaRequirements/real-time-updates.html" target="_blank">docs/RevNovaRequirements/real-time-updates.html</a>
<strong>🏗️ MVP:</strong> Week 5/5 (Nov 30 deadline)
<strong>TECH:</strong> Server-Sent Events (SSE) or WebSocket + React hooks

<strong>GOAL:</strong> Implement real-time progress updates using Server-Sent Events. Replace polling with event stream for live record counts, error notifications, status changes.

<strong>TASKS:</strong>
1. Server-Sent Events hook (useSSE custom hook)
2. Subscribe to /api/migrations/:id/stream endpoint
3. Update UI instantly on progress events
4. Handle connection failures with reconnection logic''',
        'steps': [
            ('Create useSSE Custom Hook', 'frontend/src/hooks/useSSE.ts', '''export function useSSE(url: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };
    
    eventSource.onerror = (err) => {
      setError(err);
      eventSource.close();
    };
    
    return () => eventSource.close();
  }, [url]);

  return { data, error };
}'''),
            ('Update ExecutionProgress Component', 'Replace polling with SSE', '''const { data: status } = useSSE(`/api/migrations/${migrationId}/stream`);

// Real-time updates - no polling needed!
if (status) {
  // Update progress bar, record counts automatically
}''')
        ]
    },
    'day23': {
        'title': 'Test Reports & Comparison',
        'copilot': '''<strong>Day 23 - RevNova Frontend - Test Reports & Comparison</strong>

<strong>GOAL:</strong> Build ReportViewer component with source vs target comparison tables, diff highlighting, filter by status/severity.

<strong>TASKS:</strong>
1. ReportViewer component with data tables
2. Side-by-side comparison view (source vs target)
3. Diff highlighting (red = mismatch, green = match)
4. Filters: Show all, errors only, warnings only''',
        'steps': [
            ('ReportViewer Component', 'frontend/src/components/ReportViewer.tsx', '''export function ReportViewer({ migrationId }: { migrationId: string }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get(`/migrations/${migrationId}/report`).then(res => setReport(res.data));
  }, [migrationId]);

  return (
    <div>
      <h1>Migration Report</h1>
      <p>Success Rate: {report?.summary.successRate}%</p>
      <ComparisonTable data={report?.fieldDiffs} />
    </div>
  );
}''')
        ]
    },
    'day24': {
        'title': 'Export & UI Testing',
        'copilot': '''<strong>Day 24 - RevNova Frontend - Export & UI Testing</strong>

<strong>GOAL:</strong> CSV export, Vitest component tests, accessibility testing with axe.

<strong>TASKS:</strong>
1. CSV export button (download report)
2. Vitest unit tests for all components
3. Accessibility audit with @axe-core/react''',
        'steps': [
            ('CSV Export', 'Add download button', '''<button onClick={() => {
  window.location.href = `/api/migrations/${migrationId}/report?format=csv`;
}}>
  Download CSV Report
</button>'''),
            ('Vitest Tests', 'frontend/tests/ExecutionProgress.test.tsx', '''import { render, screen } from '@testing-library/react';
import { ExecutionProgress } from '../src/components/ExecutionProgress';

test('renders progress bar', () => {
  render(<ExecutionProgress migrationId="test-123" />);
  expect(screen.getByText(/Migration in Progress/i)).toBeInTheDocument();
});''')
        ]
    },
    'day25': {
        'title': 'Final Polish & Documentation',
        'copilot': '''<strong>Day 25 - RevNova Frontend - Final Polish</strong>

<strong>GOAL:</strong> UI refinements, loading states, error boundaries, component documentation.

<strong>TASKS:</strong>
1. Add loading skeletons for all async components
2. Implement ErrorBoundary for graceful error handling
3. Update Storybook documentation
4. Final accessibility audit (WCAG 2.1 AA)''',
        'steps': [
            ('Error Boundary', 'frontend/src/components/ErrorBoundary.tsx', '''export class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. <button onClick={() => window.location.reload()}>Reload</button></div>;
    }
    return this.props.children;
  }
}'''),
            ('Final Checklist', 'Complete these items', '''✅ All components have loading states
✅ Error boundaries wrap async components
✅ Storybook updated for all components
✅ Accessibility audit passed (axe-core)
✅ Responsive design tested (mobile, tablet, desktop)''')
        ]
    }
}

# Dev3 Day 21-25 summaries
DEV3_SUMMARIES = {
    'day21': {
        'title': 'Production Deployment',
        'copilot': '''<strong>Day 21 - RevNova DevOps - Production Deployment</strong>

<strong>GOAL:</strong> Deploy to production: docker-compose for prod, SSL certificates, domain setup, GitHub Actions deploy workflow.

<strong>TASKS:</strong>
1. Production docker-compose.yml with production environment variables
2. SSL certificates with Let's Encrypt (certbot)
3. Domain setup (DNS A records for revnova.com)
4. GitHub Actions deploy workflow (SSH to production server, docker-compose up)''',
        'steps': [
            ('Production Docker Compose', 'docker-compose.prod.yml', '''version: '3.8'
services:
  backend:
    image: revnova/backend:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    restart: always
  
  frontend:
    image: revnova/frontend:latest
    ports:
      - "443:443"
    restart: always'''),
            ('GitHub Actions Deploy', '.github/workflows/deploy-prod.yml', '''name: Deploy Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/revnova
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d''')
        ]
    },
    'day22': {
        'title': 'Monitoring Setup',
        'copilot': '''<strong>Day 22 - RevNova DevOps - Monitoring Setup</strong>

<strong>GOAL:</strong> Grafana dashboards, Prometheus metrics, log aggregation with ELK stack, alerting rules.

<strong>TASKS:</strong>
1. Prometheus metrics endpoint (/metrics)
2. Grafana dashboards for backend, database, queue
3. ELK stack for log aggregation
4. Alerting rules (PagerDuty, Slack)''',
        'steps': [
            ('Prometheus Metrics', 'backend/src/metrics.ts', '''import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const migrationCounter = new promClient.Counter({
  name: 'revnova_migrations_total',
  help: 'Total number of migrations'
});

register.registerMetric(migrationCounter);

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});''')
        ]
    },
    'day23': {
        'title': 'Backup & Restore',
        'copilot': '''<strong>Day 23 - RevNova DevOps - Backup & Restore</strong>

<strong>GOAL:</strong> Automated PostgreSQL backups with pg_dump, S3/Azure Blob storage, restore procedures.

<strong>TASKS:</strong>
1. Automated pg_dump backups (daily cron job)
2. Upload to S3 with versioning
3. Restore procedure documented
4. Backup testing (restore to test environment)''',
        'steps': [
            ('Backup Script', 'scripts/backup-db.sh', '''#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backups/revnova_$DATE.sql.gz"

pg_dump $DATABASE_URL | gzip > $BACKUP_FILE
aws s3 cp $BACKUP_FILE s3://revnova-backups/

# Cleanup old backups (keep last 30 days)
find /backups -name "revnova_*.sql.gz" -mtime +30 -delete''')
        ]
    },
    'day24': {
        'title': 'Load Testing',
        'copilot': '''<strong>Day 24 - RevNova DevOps - Load Testing</strong>

<strong>GOAL:</strong> k6 load tests, test migration with 10K+ records, identify bottlenecks, performance tuning.

<strong>TASKS:</strong>
1. k6 load test scripts
2. Test full migration pipeline with 10K records
3. Identify bottlenecks (database queries, API response times)
4. Performance tuning recommendations''',
        'steps': [
            ('k6 Load Test', 'tests/load/migration.js', '''import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50, // 50 virtual users
  duration: '5m'
};

export default function() {
  let res = http.post('http://localhost:3000/api/migrations', JSON.stringify({
    connectionId: 'test-conn',
    name: 'Load Test Migration'
  }), { headers: { 'Content-Type': 'application/json' } });
  
  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
}''')
        ]
    },
    'day25': {
        'title': 'Documentation & Runbooks',
        'copilot': '''<strong>Day 25 - RevNova DevOps - Final Documentation</strong>

<strong>GOAL:</strong> Deployment runbook, troubleshooting guide, disaster recovery plan, maintenance schedules.

<strong>TASKS:</strong>
1. Deployment runbook (step-by-step production deployment)
2. Troubleshooting guide (common issues + solutions)
3. Disaster recovery plan (backup restore, failover procedures)
4. Maintenance schedules (database vacuum, log rotation)''',
        'steps': [
            ('Deployment Runbook', 'docs/RUNBOOK.md', '''# RevNova Deployment Runbook

## Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] SSL certificates valid

## Deployment Steps
1. Backup production database
2. Pull latest Docker images
3. Run database migrations
4. Deploy with zero downtime (blue-green)
5. Verify health checks
6. Monitor logs for 30 minutes'''),
            ('Congratulations Message', 'Week 5 Complete!', '''🎉 You've completed the RevNova DevOps & QA setup!
✅ Production deployment ready
✅ Monitoring and alerting configured
✅ Backup and restore procedures tested
✅ Load testing completed
✅ Documentation complete

The platform is production-ready for MVP launch (November 30)!''')
        ]
    }
}

def add_content_to_file(filepath, day_data):
    """Add comprehensive content to a Week 5 file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the section to replace (between header and nav buttons)
    pattern = r'(</div>\s*<div class="step-card">.*?</div>.*?<div class="step-card">.*?</ol>\s*</div>)'
    
    # Build new content
    new_content = f'''</div>

        <div class="step-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
            <h2>🤖 Enhanced Copilot Prompt</h2>
            <div style="background:#f5f5f5;padding:1.5rem;border-radius:6px;margin:1rem 0;border-left:3px solid #4caf50;">
<pre style="white-space:pre-wrap;font-family:monospace;font-size:0.9em;line-height:1.6;margin:0;">
{day_data['copilot']}
</pre>
            </div>
        </div>

        <div class="step-card">
            <h2>📋 Implementation Steps</h2>'''
    
    for i, (step_title, file_desc, code) in enumerate(day_data['steps'], 1):
        new_content += f'''
            <h3>Step {i}: {step_title}</h3>
            <p><strong>File:</strong> <code>{file_desc}</code></p>
            <div style="background:#2d2d2d;color:#f8f8f2;padding:1rem;border-radius:6px;font-family:monospace;margin:1rem 0;">
<pre style="margin:0;white-space:pre-wrap;">{code}</pre>
            </div>'''
    
    new_content += '''
        </div>

        <div class="step-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
            <h2>✅ Acceptance Criteria</h2>
            <ul style="line-height:1.8;">
                <li>✅ Implementation complete with working code</li>
                <li>✅ All tests passing</li>
                <li>✅ Documentation updated</li>
            </ul>
        </div>'''
    
    # Replace content
    content = re.sub(pattern, new_content, content, flags=re.DOTALL)
    
    # Update title to include Week 5/5
    content = re.sub(
        r'(<h1>Day \d+: .*?</h1><p>Developer \d+ — .*?)(</p>)',
        r'\1 | Week 5/5\2',
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    docs_dir = Path(__file__).parent.parent / 'docs' / 'Onboarding'
    
    print("Completing Week 5 implementation guides...")
    print("=" * 60)
    
    updated_count = 0
    
    # Dev2 Days 22-25
    for day_num in range(22, 26):
        day_key = f'day{day_num}'
        filepath = docs_dir / f'dev2-{day_key}.html'
        
        if day_key in DEV2_SUMMARIES and filepath.exists():
            print(f"  ✅ dev2-{day_key}.html - {DEV2_SUMMARIES[day_key]['title']}")
            add_content_to_file(filepath, DEV2_SUMMARIES[day_key])
            updated_count += 1
    
    # Dev3 Days 21-25
    for day_num in range(21, 26):
        day_key = f'day{day_num}'
        filepath = docs_dir / f'dev3-{day_key}.html'
        
        if day_key in DEV3_SUMMARIES and filepath.exists():
            print(f"  ✅ dev3-{day_key}.html - {DEV3_SUMMARIES[day_key]['title']}")
            add_content_to_file(filepath, DEV3_SUMMARIES[day_key])
            updated_count += 1
    
    print("=" * 60)
    print(f"\n✨ Complete! Updated {updated_count} Week 5 files with implementation guides")

if __name__ == '__main__':
    main()
