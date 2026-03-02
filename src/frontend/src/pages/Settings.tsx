import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type UserPermissions, useRBAC } from "@/context/RBACContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Lock, Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

function truncatePrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}…${principal.slice(-4)}`;
}

function formatJoinDate(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ts));
}

export default function Settings() {
  const { isAdmin, getAllUsers, setUserPermissions, adminPrincipal } =
    useRBAC();
  const { identity } = useInternetIdentity();

  const currentPrincipal = identity?.getPrincipal().toString() ?? "";
  const currentIsAdmin = isAdmin(currentPrincipal);

  if (!currentIsAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-destructive" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-display font-bold text-lg text-foreground">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Only administrators can manage user permissions. Contact your admin
            to request access.
          </p>
        </div>
      </div>
    );
  }

  const users = getAllUsers();
  const nonAdminUsers = users.filter((u) => u.principal !== adminPrincipal);

  function handlePermissionChange(
    principal: string,
    field: keyof UserPermissions,
    value: boolean,
  ) {
    const currentUser = users.find((u) => u.principal === principal);
    if (!currentUser) return;

    const updated: UserPermissions = {
      ...currentUser.permissions,
      [field]: value,
    };
    setUserPermissions(principal, updated);
    toast.success(`Permissions updated for ${truncatePrincipal(principal)}`);
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Admin info banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Admin Account
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground truncate cursor-help font-mono">
                      {truncatePrincipal(adminPrincipal ?? "")}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs font-mono bg-popover border-border">
                    {adminPrincipal}
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge className="ml-auto flex-shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                Admin
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Users management */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base font-display font-semibold">
                User Access Control
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              Manage read, write, add, and delete permissions for each user.
              Changes are saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {nonAdminUsers.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-6">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-muted-foreground opacity-50" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    No users registered yet
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Users will appear here once they sign in to the application
                    for the first time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 pl-5">
                        Principal
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 whitespace-nowrap">
                        Joined
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 text-center w-20">
                        Read
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 text-center w-20">
                        Write
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 text-center w-20">
                        Add
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 text-center w-20">
                        Delete
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 text-center w-20">
                        Role
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nonAdminUsers.map((user) => {
                      const { permissions } = user;
                      return (
                        <TableRow
                          key={user.principal}
                          className="hover:bg-accent/20 transition-colors"
                        >
                          <TableCell className="py-3.5 pl-5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm font-mono text-foreground cursor-help">
                                  {truncatePrincipal(user.principal)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-xs font-mono bg-popover border-border break-all">
                                {user.principal}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                            {formatJoinDate(user.addedAt)}
                          </TableCell>
                          {/* Read */}
                          <TableCell className="py-3.5 text-center">
                            <Checkbox
                              checked={permissions.canRead}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  user.principal,
                                  "canRead",
                                  !!checked,
                                )
                              }
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              aria-label={`Read access for ${truncatePrincipal(user.principal)}`}
                            />
                          </TableCell>
                          {/* Write */}
                          <TableCell className="py-3.5 text-center">
                            <Checkbox
                              checked={permissions.canWrite}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  user.principal,
                                  "canWrite",
                                  !!checked,
                                )
                              }
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              aria-label={`Write access for ${truncatePrincipal(user.principal)}`}
                            />
                          </TableCell>
                          {/* Add */}
                          <TableCell className="py-3.5 text-center">
                            <Checkbox
                              checked={permissions.canAdd}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  user.principal,
                                  "canAdd",
                                  !!checked,
                                )
                              }
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              aria-label={`Add access for ${truncatePrincipal(user.principal)}`}
                            />
                          </TableCell>
                          {/* Delete */}
                          <TableCell className="py-3.5 text-center">
                            <Checkbox
                              checked={permissions.canDelete}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  user.principal,
                                  "canDelete",
                                  !!checked,
                                )
                              }
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              aria-label={`Delete access for ${truncatePrincipal(user.principal)}`}
                            />
                          </TableCell>
                          {/* Role */}
                          <TableCell className="py-3.5 text-center">
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground"
                            >
                              User
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission legend */}
        <Card className="border-border bg-secondary/20">
          <CardContent className="py-4 px-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Permission Guide
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Read", desc: "View dashboard and entries" },
                { label: "Write", desc: "Edit existing entries" },
                { label: "Add", desc: "Create new entries" },
                { label: "Delete", desc: "Remove entries permanently" },
              ].map(({ label, desc }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
