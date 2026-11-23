"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Burger, Group, NavLink, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const NAV = [
  { href: "/employees", label: "Employees", description: "Directory and pay records" },
  { href: "/insights", label: "Insights", description: "How ACME pays people" },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
          <ThemeIcon size="lg" radius="md" variant="filled">
            A
          </ThemeIcon>
          <div>
            <Text fw={650} lh={1.1}>
              ACME Salary Management
            </Text>
            <Text size="xs" c="dimmed" lh={1.1}>
              HR workspace
            </Text>
          </div>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="sm">
        {NAV.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            description={item.description}
            active={pathname.startsWith(item.href)}
            onClick={close}
            variant="light"
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main bg="gray.0">{children}</AppShell.Main>
    </AppShell>
  );
}
