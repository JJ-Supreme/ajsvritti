const FooterBottomBar = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} AJS VRITTI VISION MARKETING PRIVATE LIMITED. All rights reserved.
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">We accept:</span>
          <div className="flex items-center">
            <div className="w-12 h-8 bg-white rounded-md shadow-sm border border-gray-200 flex items-center justify-center">
              <svg viewBox="0 0 38 24" className="h-4" xmlns="http://www.w3.org/2000/svg">
                <path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
                <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/>
                <path fill="#003087" d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"/>
                <path fill="#3086C8" d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="hidden md:block h-6 w-px bg-gray-200"></div>

        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">Need help?</span>
          <a href="mailto:ajsvrttivision@gmail.com" className="text-blue-600 hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default FooterBottomBar;
