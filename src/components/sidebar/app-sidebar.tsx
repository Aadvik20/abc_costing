import * as React from 'react';
import { ChevronsLeft, ChevronsRight, LogOut, Hotel, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarRail, SidebarSeparator, useSidebar } from '@/components/ui/sidebar';
import { environment } from '@/config';
import { clearAllStorage } from '@/lib/helperFunction';
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
      title: 'Master',
      icon: Clock,
      roles: ['User'],
      children: [
        { title: 'corridormaster', url: '/corridormaster', roles: ['User'] },
        { title: 'Project Office', url: '/projectoffice', roles: ['User'] },
        { title: 'Department', url: '/departmentmaster', roles: ['User'] },
        { title: 'Department Mapping', url: '/unitdepartments', roles: ['User'] },
        { title: 'Cost Group', url: '/costgroup', roles: ['User'] },
        { title: 'Daily Transactions', url: '/dailytransactions', roles: ['User'] },
      ],
    },
    {
      title: 'Template',
      url: '/ActivityBasedCosting', // add a route for this, or change the path
      icon: FileText,
      roles: ['User'],
    },
  ];

  // keep only what this user's roles allow; hide a group if none of its links remain
  const canSee = (x: { roles: string[] }) => x.roles.some((role) => Roles?.includes(role));
  const navMainItems = allNavItems
    .filter(canSee)
    .map((item) => (item.children ? { ...item, children: item.children.filter(canSee) } : item))
    .filter((item) => !item.children || item.children.length > 0);

  const handleLogout = () => {
    clearAllStorage();
    window.location.href = environment.exitUrl;
  };
  const ToggleIcon = state === 'collapsed' ? ChevronsRight : ChevronsLeft;
  const menuButtonBaseClass =
    'transition-all duration-300 ease-in-out h-full w-full cursor-pointer active:bg-primary hover:bg-primary hover:text-white [&>svg]:size-7';

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex justify-end md:pt-[90px] px-2">
        <button onClick={toggleSidebar} aria-label={state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'} className="rounded-md p-1 hover:bg-primary/10">
          <ToggleIcon className="w-7 h-7 cursor-pointer" />
        </button>
      </div>
      <SidebarSeparator />
      <SidebarContent className="flex justify-between">
        <NavMain items={navMainItems} />
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
