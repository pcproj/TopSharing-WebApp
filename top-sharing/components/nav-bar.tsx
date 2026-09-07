"use client";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "cn";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { signOut, useSession } from "next-auth/react";

export default function NavigationBar() {
	const { status } = useSession()

	return (
		<div className="w-full border-b p-1">
			<NavigationMenu className="max-w-none w-full px-2">
				<NavigationMenuList className="w-full flex items-center justify-between gap-1">
					<NavigationMenuItem>
						<NavigationMenuLink render={<Link href="/" />} className={cn(buttonVariants({ variant: "secondary" }))}>
							TopSharing
						</NavigationMenuLink>
					</NavigationMenuItem>
					{status === "unauthenticated" && (
						<>
							<NavigationMenuItem className="ml-auto">
								<NavigationMenuLink render={<Link href="/login" />} className={cn(buttonVariants({ variant: "default" }))}>
									Login
								</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink render={<Link href="/register" />} className={cn(buttonVariants({ variant: "secondary" }))}>
									Register
								</NavigationMenuLink>
							</NavigationMenuItem>
						</>
					)}
					{status === "authenticated" && (
						<>
							<NavigationMenuItem className="ml-auto">
								<NavigationMenuLink render={<Link href="/dashboard" />} className={cn(buttonVariants({ variant: "default" }))}>
									Dashboard
								</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
									Logout
								</Button>
							</NavigationMenuItem>
						</>
					)}
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	);
}

