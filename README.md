# نظام إدارة آبار المياه - Water Wells Management System

**الجهاز التنفيذي لحفر وصيانة آبار المياه**
**Executive Authority for Drilling and Maintaining Water Wells**
**وزارة الموارد المائية - ليبيا / Ministry of Water Resources - Libya**

---

## Quick Start

```bash
docker-compose up -d
```

Access at: http://localhost

### Demo Credentials
| Role | Username | Password |
|------|----------|----------|
| System Admin | admin | Admin@123 |
| Department Manager | manager | Admin@123 |
| Employee | employee | Admin@123 |

---

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Leaflet.js, Recharts
- **Backend**: Express.js REST API
- **Database**: PostgreSQL + PostGIS
- **Auth**: JWT with RBAC
- **i18n**: Arabic RTL + English LTR
- **Export**: jsPDF + xlsx
- **Deploy**: Docker + Nginx
