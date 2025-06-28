"use client"

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { AlertTriangle, BarChart3 } from 'lucide-react'

// Dynamically import Recharts components with no SSR
const RechartsComponents = dynamic(
  () => import('recharts').then((mod) => ({
    default: mod,
    AreaChart: mod.AreaChart,
    Area: mod.Area,
    BarChart: mod.BarChart,
    Bar: mod.Bar,
    LineChart: mod.LineChart,
    Line: mod.Line,
    PieChart: mod.PieChart,
    Pie: mod.Pie,
    Cell: mod.Cell,
    XAxis: mod.XAxis,
    YAxis: mod.YAxis,
    CartesianGrid: mod.CartesianGrid,
    ResponsiveContainer: mod.ResponsiveContainer,
    Legend: mod.Legend,
    Tooltip: mod.Tooltip,
  })),
  {
    ssr: false,
    loading: () => <ChartLoadingFallback />,
  }
)

// Chart loading fallback
const ChartLoadingFallback = () => (
  <div className="flex items-center justify-center h-[250px] w-full bg-gray-50 rounded-lg">
    <div className="text-center">
      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
      <p className="text-sm text-gray-500">Loading chart...</p>
    </div>
  </div>
)

// Chart error fallback
const ChartErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex items-center justify-center h-[250px] w-full bg-red-50 rounded-lg">
    <div className="text-center">
      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
      <p className="text-sm text-red-600 mb-2">Chart failed to load</p>
      <button
        onClick={retry}
        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
      >
        Retry
      </button>
    </div>
  </div>
)

// No data fallback
const NoDataFallback = ({ message = "No data available" }: { message?: string }) => (
  <div className="flex items-center justify-center h-[250px] w-full bg-gray-50 rounded-lg">
    <div className="text-center">
      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  </div>
)

interface ChartWrapperProps {
  title: string
  description: string
  data: any[]
  children: React.ReactNode
  className?: string
  noDataMessage?: string
}

export function ChartWrapper({
  title,
  description,
  data,
  children,
  className = "",
  noDataMessage = "No data available"
}: ChartWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleError = (error: Error) => {
    console.error('Chart error:', error)
    setError(error)
    setHasError(true)
  }

  const retry = () => {
    setHasError(false)
    setError(null)
  }

  // Show loading state on server-side
  if (!isClient) {
    return (
      <Card className={`bg-white/90 backdrop-blur-sm overflow-hidden ${className}`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartLoadingFallback />
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (hasError && error) {
    return (
      <Card className={`bg-white/90 backdrop-blur-sm overflow-hidden ${className}`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartErrorFallback error={error} retry={retry} />
        </CardContent>
      </Card>
    )
  }

  // Show no data state
  if (!data || data.length === 0) {
    return (
      <Card className={`bg-white/90 backdrop-blur-sm overflow-hidden ${className}`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <NoDataFallback message={noDataMessage} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white/90 backdrop-blur-sm overflow-hidden ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <React.Suspense fallback={<ChartLoadingFallback />}>
            <ErrorBoundary onError={handleError}>
              {children}
            </ErrorBoundary>
          </React.Suspense>
        </div>
      </CardContent>
    </Card>
  )
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return <ChartErrorFallback error={this.state.error!} retry={() => this.setState({ hasError: false, error: null })} />
    }

    return this.props.children
  }
}

// Export Recharts components for use in other files
export { RechartsComponents } 