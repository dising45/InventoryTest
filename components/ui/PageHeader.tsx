import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  action?: ReactNode
}

export const PageHeader = ({ title, action }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-2 sm:static sm:bg-transparent">
    <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
    {action && <div className="hidden sm:block">{action}</div>}
  </div>
)