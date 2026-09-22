import { RootState } from '@/app/store';
import { logo } from '@/assets/image/images';
import LogoutButton from '@/auth/LogoutButton';
import { AlignJustify, Info } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { useSidebar } from './ui/sidebar';

const isUAT = import.meta.env.VITE_ENV !== 'production';

// Static unique keys for marquee items – avoids using array index as key
const MARQUEE_KEYS = ['marquee-1', 'marquee-2', 'marquee-3', 'marquee-4', 'marquee-5', 'marquee-6'];

const SiteHeader: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const { toggleSidebar } = useSidebar();
  const { decoded } = useSelector((state: RootState) => state.tokenData);
  return (
    <div className="sticky top-0 z-50">
      {/* UAT Warning Marquee — hidden in production */}
      {isUAT && (
        <div className="bg-yellow-400 border-b-2 border-yellow-600 overflow-hidden py-0.5">
          <div
            className="whitespace-nowrap text-yellow-900 font-semibold text-xs"
            style={{ display: 'inline-block', animation: 'marquee 30s linear infinite' }}
          >
            {MARQUEE_KEYS.map((key) => (
              <span key={key} className="mx-10">
                ⚠️ TESTING ENVIRONMENT — This portal is for UAT/testing purposes only. Data entered here is not for official use. &nbsp;|
              </span>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}

      <header className="bg-white shadow-md sticky top-0 w-full z-50 border-b-4 border-red-600 h-12 sm:h-16 md:h-[80px] px-2 sm:px-4">
        <div className="flex items-center justify-between h-full p-2">
          <div className="flex items-center space-x-4 ">
            <div className="md:hidden">
              <AlignJustify className="w-8 h-8 cursor-pointer rounded-md transition-all " onClick={toggleSidebar} />
            </div>
            <img src={logo} alt="Company Logo" className="hidden md:block object-contain h-8 sm:h-10 md:h-12 w-auto" />
            <Link to="#" className="hidden sm:flex flex-col text-primary">
              <span className="text-md md:text-lg font-semibold">Dedicated Freight Corridor Corporation of India Limited</span>
              <span className="text-sm md:text-md text-gray-600">A Govt. of India (Ministry of Railways) Enterprise</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && user?.name && (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div>
                  <div className="hidden md:block text-gray-800 text-sm md:text-md lg:text-lg font-semibold ">{user.name}</div>
                  <div className="hidden md:block text-gray-500 text-xs md:text-sm lg:text-md">
                    {user.Department} / {user.Unit}
                  </div>
                  <div>
                    {decoded?.IsD === 'True' && decoded?.IsB !== 'True' && (
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3 text-red-600" />
                        <p className="text-xs font-medium text-red-600">Delegated Access Active</p>
                      </div>
                    )}
                    {decoded?.IsReadOnly === 'True' && (
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3 text-red-600" />
                        <p className="text-xs font-medium text-red-600">Impersonate User Active</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default SiteHeader;
