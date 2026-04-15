import * as React from 'react';
import { ChevronLeft, ChevronRight, LogOut, Hotel, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarRail, SidebarSeparator, useSidebar } from '@/components/ui/sidebar';
import { environment } from '@/config';
import { clearAllStorage } from '@/lib/helperFunction';
import { Home, Landmark } from 'lucide-react';
import { NavItem } from '@/types/types';
import { Separator } from '../ui/separator';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const { Roles } = useAppSelector((state: RootState) => state.user);
  const canAccessAdminDashboard = false;
  const allNavItems: NavItem[] = [
    {
      title: 'Purchase Order',
      url: '/purchaseOrder',
      icon: Home,
      roles: [2 , 0],
    },
    {
      title: 'Finance',
      url: '/Finance',
      icon: Landmark,
      roles: [1 , 0],
    },
    {
      title: 'Role Assignment',
      url: '/roleAssignment',
      icon: User,
      roles: [1000 , 0],
    },

    {
      title: 'Purchase Order V2',
      url: '/purchaseOrderv2',
      icon: Home,
      roles: [2 , 0],
    },
    {
      title: 'Finance V2',
      url: '/financeV2',
      icon: Landmark,
      roles: [1 , 0],
    },
    {
      title: 'Demand Budget',
      url: '/budgetDemand',
      icon: Landmark,
      roles: [2 , 0],
    },
  ];

  const navMainItems = allNavItems.filter((item) => item.roles.some((role) => Roles.includes(role)));
  const handleLogout = () => {
    clearAllStorage();
    window.location.href = environment.exitUrl;
  };
  const ToggleIcon = state === 'collapsed' ? ChevronRight : ChevronLeft;
  const menuButtonBaseClass =
    'transition-all duration-300 ease-in-out h-full w-full cursor-pointer active:bg-primary hover:bg-primary hover:text-white [&>svg]:size-7';

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex justify-end md:pt-[90px] px-2">
        <ToggleIcon onClick={toggleSidebar} className="w-8 h-8 cursor-pointer" />
      </div>
      <SidebarSeparator />

      <SidebarContent className="flex justify-between">
        {/* <NavMain items={navMainItems} /> */}
        <div>
          <NavMain items={navMainItems.slice(0, 3)} />

          {/* Temporary separator */}
          <SidebarSeparator className="my-2" />

          <NavMain items={navMainItems.slice(3)} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {canAccessAdminDashboard && (
            <SidebarMenuButton
              onClick={() => {
                navigate('/reporting-request-recieved');
              }}
              asChild
              tooltip={'Manage Organization'}
              className={`transition-all text-black cursor-pointer duration-300  active:bg-primary [&>svg]:size-7 ease-in-out hover:bg-primary hover:text-white h-full w-full active:text-white`}
            >
              <div className={`flex items-center gap-2`}>
                <Hotel size={24} />
                <span>Manage Organization</span>
              </div>
            </SidebarMenuButton>
          )}
          <Separator />
          <SidebarMenuButton onClick={handleLogout} tooltip="Exit" asChild className={`${menuButtonBaseClass} hidden sm:flex`}>
            <div className="flex items-center gap-2">
              <LogOut size={24} />
              <span>Exit</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
