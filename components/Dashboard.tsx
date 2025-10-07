import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useClerk } from '@clerk/clerk-react';

const Dashboard = () => {
  const { signOut, user } = useClerk();

  // Function href get user's initials
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    } else if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return;
  };

  const handleSignOut = () => {
    const currentUrl = window.location.href;
    signOut({ redirectUrl: currentUrl });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" asChild>
          <Avatar className="mr-4 size-9 translate-y-1 md:translate-y-0">
            <AvatarImage
              className="cursor-pointer object-cover"
              src={user?.imageUrl}
            />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mt-4 w-[170px]" align="center">
          <DropdownMenuItem className="focus:bg-primary block w-full cursor-pointer focus:text-white">
            <Link className="w-full" href="profile">
              Manage Account
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="focus:bg-primary cursor-pointer focus:text-white"
            onClick={handleSignOut}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default Dashboard;
