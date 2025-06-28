"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface ChartDebugProps {
  chartName: string
  data: any[]
  children: React.ReactNode
}

export function ChartDebug({ chartName, data, children }: ChartDebugProps) {
  const [isClient, setIsClient] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [rechartsLoaded, setRechartsLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Check if Recharts is available
    try {
      import('recharts').then(() => {
        setRechartsLoaded(true)
      }).catch((err) => {
        console.error('Recharts failed to load:', err)
        setErrorMessage('Recharts library failed to load')
        setHasError(true)
      })
    } catch (err) {
      console.error('Error checking Recharts:', err)
      setErrorMessage('Error checking chart library')
      setHasError(true)
    }
  }, [])

  if (!isClient) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>{chartName}</CardTitle>
          <CardDescription>Loading chart...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] w-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <Info className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
              <p className="text-sm text-gray-500">Server-side rendering...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>{chartName}</CardTitle>
          <CardDescription>Chart Error</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] w-full bg-red-50 rounded-lg">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-sm text-red-600 mb-2">Chart failed to load</p>
              <p className="text-xs text-red-500 mb-4">{errorMessage}</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Recharts loaded: {rechartsLoaded ? 'Yes' : 'No'}</p>
                <p>• Data length: {data?.length || 0}</p>
                <p>• Client-side: {isClient ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!rechartsLoaded) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>{chartName}</CardTitle>
          <CardDescription>Loading chart library...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] w-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <Info className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
              <p className="text-sm text-gray-500">Loading Recharts...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>{chartName}</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] w-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">No data available for this chart</p>
              <p className="text-xs text-gray-400 mt-1">Data length: {data?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {chartName}
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardTitle>
        <CardDescription>Chart loaded successfully</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {children}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Debug: Data points: {data.length} | Recharts: Loaded | Client: Ready
        </div>
      </CardContent>
    </Card>
  )
} 