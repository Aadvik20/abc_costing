import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronDown } from 'lucide-react';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types/types';

const isActive = (pathname: string, url?: string) => !!url && (pathname === url || pathname.startsWith(url + '/'));

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1.5">
        {items.map((item) => (item.children ? <NavGroup key={item.title} item={item} /> : <NavLeaf key={item.title} item={item} />))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/* ---------- expandable group, e.g. "Master" ---------- */
function NavGroup({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const children = item.children ?? [];
  const active = children.some((c) => isActive(pathname, c.url));
  const [expanded, setExpanded] = useState(active);
  useEffect(() => {
    if (active) setExpanded(true);
  }, [active]);

  const railMode = state === 'collapsed' && !isMobile; // sidebar shrunk to icons
  const showSub = expanded && !railMode;

  // in icon mode a click first widens the sidebar, then the group opens
  const handleClick = () => {
    if (railMode) {
      setOpen(true);
      setExpanded(true);
    } else {
      setExpanded((v) => !v);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        aria-expanded={showSub}
        onClick={handleClick}
        className={cn(
          'h-11 cursor-pointer rounded-xl font-semibold transition-colors [&>svg]:size-5',
          active
            ? 'bg-primary text-white shadow-md hover:bg-primary/90 hover:text-white active:bg-primary/90 active:text-white'
            : 'hover:bg-primary/10 hover:text-primary active:bg-primary/10',
        )}
      >
        <item.icon />
        <span>{item.title}</span>
        <ChevronDown className={cn('ml-auto !size-4 transition-transform duration-200', expanded && 'rotate-180')} />
      </SidebarMenuButton>

      {/* height animates 0fr -> 1fr; "invisible" keeps hidden links out of the tab order */}
      <div className={cn('grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none', showSub ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <SidebarMenuSub
          className={cn('mx-0 min-h-0 translate-x-0 gap-0.5 overflow-hidden border-l-0 px-0 py-0 transition-[visibility] duration-200', !showSub && 'invisible')}
        >
          <li aria-hidden className="h-1" />
          {children.map((sub) => {
            const activeSub = isActive(pathname, sub.url);
            return (
              <SidebarMenuSubItem key={sub.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={activeSub}
                  className="h-10 gap-3 rounded-lg pl-10 text-sm data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary"
                >
                  <Link to={sub.url} onClick={() => isMobile && setOpenMobile(false)}>
                    <span className={cn('size-1.5 shrink-0 rounded-full', activeSub ? 'bg-primary' : 'bg-muted-foreground/60')} />
                    <span>{sub.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </div>
    </SidebarMenuItem>
  );
}

/* ---------- single link, e.g. "Template" (dot when wide, icon when collapsed) ---------- */
function NavLeaf({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const active = isActive(pathname, item.url);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        isActive={active}
        className="h-10 rounded-xl [&>svg]:size-5 data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary"
      >
        <Link to={item.url ?? '#'} onClick={() => isMobile && setOpenMobile(false)}>
          <span className="ml-1.5 size-1.5 shrink-0 rounded-full bg-current group-data-[collapsible=icon]:hidden" />
          <item.icon className="hidden group-data-[collapsible=icon]:block" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
