import {
  Box,
  CarFront,
  GitBranch,
  LayoutDashboard,
  Network,
  Scale,
  ShieldCheck,
  Share2,
  Star,
  Workflow,
} from 'lucide-react'

export const NAV_ITEMS = [
  {
    label: 'Admin Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    description: 'Project overview and current implementation status.',
    status: 'Workspace',
  },
  {
    label: 'Data Collection & ETL',
    path: '/etl',
    icon: Workflow,
    description: 'Inspect the source datasets and prepare warehouse records.',
    status: 'Pipeline & audit ready',
  },
  {
    label: 'Data Warehouse Architecture',
    path: '/warehouse',
    icon: Box,
    description: 'Explore the approved PostgreSQL warehouse design.',
    status: 'Star & Snowflake active',
  },
  {
    label: 'Interactive 3D OLAP Cube',
    path: '/olap-cube',
    icon: Network,
    description: 'Discover dimensional analysis and OLAP operations.',
    status: 'Preview ready · data pending',
  },
  {
    label: 'Star Schema (3D)',
    path: '/star-schema',
    icon: Star,
    description: 'Explore the fact table and its dimensions in 3D.',
    status: 'Schema preview ready',
  },
  {
    label: 'Snowflake Schema (3D)',
    path: '/snowflake-schema',
    icon: GitBranch,
    description: 'Explore normalized warehouse dimensions in 3D.',
    status: 'Schema preview ready',
  },
  {
    label: 'Star vs Snowflake',
    path: '/comparison',
    icon: Scale,
    description: 'Compare the two warehouse designs and trade-offs.',
    status: 'Comparison ready',
  },
  {
    label: 'Graph-Based Pattern Mining',
    path: '/pattern-mining',
    icon: Share2,
    description: 'Explore schema-supported attribute relationships as a graph.',
    status: 'Schema preview · records pending',
  },
  {
    label: 'Vehicle Analytics Dashboard',
    path: '/vehicle-analytics',
    icon: CarFront,
    description: 'Review marketplace analytics from the Star Schema API.',
    status: 'API ready · database pending',
  },
]

export const MODULES = NAV_ITEMS.slice(1)

export const MARKETPLACE_REVIEW_ITEM = {
  label: 'Seller & Listing Verification',
  path: '/marketplace-review',
  icon: ShieldCheck,
  description: 'Verify seller evidence, moderate listings, and monitor simulated transactions.',
}

export const WORKFLOW_STEPS = [
  { label: 'CSV Sources', detail: 'Three inspected datasets', icon: Box },
  { label: 'ETL', detail: 'Verified mappings · dry-run', icon: Workflow },
  { label: 'PostgreSQL', detail: 'Star Schema design', icon: LayoutDashboard },
  { label: 'OLAP', detail: 'Dimensional exploration', icon: Network },
  { label: 'Data Mining', detail: 'Pattern discovery', icon: Share2 },
  { label: 'Analytics', detail: 'Source-aware insights', icon: CarFront },
]
