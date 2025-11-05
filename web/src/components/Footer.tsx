export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              MetaShift
            </h3>
            <p className="mt-4 text-gray-500 max-w-md">
              Decentralized Ad-to-Earn Economy for Web3 Users. 
              Built on Polygon with instant SideShift crypto rewards.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="/advertiser" className="text-gray-500 hover:text-gray-700">For Advertisers</a>
              </li>
              <li>
                <a href="/host" className="text-gray-500 hover:text-gray-700">For Hosts</a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Built With</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://polygon.technology" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                  Polygon Network
                </a>
              </li>
              <li>
                <a href="https://sideshift.ai" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                  SideShift API
                </a>
              </li>
              <li>
                <a href="https://thegraph.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                  The Graph
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} MetaShift. Built on Polygon.
          </p>
        </div>
      </div>
    </footer>
  );
}