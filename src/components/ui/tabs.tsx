import * as React from "react"

export interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

export interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export const Tabs = ({ defaultValue, value, onValueChange, children, className = '' }: TabsProps) => {
  const [selectedTab, setSelectedTab] = React.useState(defaultValue || '')
  
  const handleChange = (newValue: string) => {
    setSelectedTab(newValue)
    onValueChange?.(newValue)
  }

  const currentValue = value !== undefined ? value : selectedTab

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={className} data-value={currentValue}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export const TabsList = ({ children, className = '' }: TabsListProps) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600 ${className}`}>
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabsTrigger = ({ value, children, className = '' }: TabsTriggerProps) => {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value
  
  return (
    <button
      type="button"
      onClick={() => context?.onValueChange(value)}
      data-state={isActive ? 'active' : 'inactive'}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabsContent = ({ value, children, className = '' }: TabsContentProps) => {
  const context = React.useContext(TabsContext)
  
  if (context?.value !== value) return null
  
  return (
    <div 
      data-state={context?.value === value ? 'active' : 'inactive'}
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  )
}
