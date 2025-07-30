export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          TailwindCSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Primary Color</h3>
            <p className="text-gray-600 text-center">This card uses primary colors from our theme</p>
          </div>
          
          {/* Test Card 2 */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2 text-center">Gradient Background</h3>
            <p className="text-center opacity-90">This card uses gradient backgrounds</p>
          </div>
          
          {/* Test Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-primary-200">
            <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Animated Element</h3>
            <p className="text-gray-600 text-center">This card has animated elements</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl">
            Test Button
          </button>
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Color Palette Test</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">50</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">100</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-200 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">200</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-300 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">300</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-400 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">400</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">500</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">600</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-700 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">700</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-800 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">800</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-900 rounded-lg mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">900</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 