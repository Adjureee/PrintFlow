const navigation = [
  {
    label: "Public",
    description: "Pages available without signing in.",
    children: [
      {
        path: "/login",
        label: "Login",
        description: "Sign in to access student or shop features.",
      },
      {
        path: "/signup",
        label: "Signup",
        description: "Create a new student or shop account.",
      },
      {
        path: "/poster",
        label: "PrintFlow Poster",
        description: "Static poster/marketing page.",
      },
    ],
  },
  {
    label: "Student App",
    description: "Protected routes for students after authentication.",
    children: [
      {
        path: "/",
        label: "Student Home",
        description:
          "Default landing page for students with print setup and shop discovery.",
      },
      {
        path: "/settings",
        label: "Print Settings",
        description: "Choose print options before submitting the order.",
      },
      {
        path: "/status/:orderId",
        label: "Order Status",
        description: "Track a single order by its ID.",
      },
      {
        path: "/profile",
        label: "Profile",
        description: "Edit personal information and preferences.",
      },
      {
        path: "/shops/:shopSlug",
        label: "Shop Profile",
        description: "View a shop's details, services, and contact options.",
      },
      {
        path: "/shops/:shopSlug/contact",
        label: "Shop Chat",
        description: "Chat with the print shop owner or AI assistant.",
      },
    ],
  },
  {
    label: "Shop Dashboard",
    description: "Protected routes for shop owners.",
    children: [
      {
        path: "/shop",
        label: "Shop Home",
        description: "Owner dashboard and quick actions.",
      },
      {
        path: "/shop/order/:orderId",
        label: "Order Detail",
        description: "Review a specific order and its status.",
      },
      {
        path: "/shop/profile",
        label: "Shop Profile",
        description: "Update shop information and appearance.",
      },
      {
        path: "/shop/analytics",
        label: "Analytics",
        description: "View business metrics and activity trends.",
      },
      {
        path: "/shop/notifications",
        label: "Notifications",
        description: "Check pending alerts and updates.",
      },
    ],
  },
  {
    label: "Fallback",
    description: "Unmatched routes are redirected back to the home page.",
    children: [
      {
        path: "*",
        label: "Catch-all",
        description: "Any unknown route redirects to /.",
      },
    ],
  },
];

function printNode(node, indent = "") {
  console.log(`${indent}${node.label}`);
  if (node.description) {
    console.log(`${indent}  ${node.description}`);
  }

  for (const child of node.children ?? []) {
    console.log(`${indent}  - ${child.path} :: ${child.label}`);
    if (child.description) {
      console.log(`${indent}    ${child.description}`);
    }
  }
}

function asMarkdown() {
  const lines = [
    "# PrintFlow Navigation",
    "",
    "This script describes the app's route structure and the purpose of each screen.",
    "",
  ];

  for (const section of navigation) {
    lines.push(`## ${section.label}`);
    lines.push(section.description);
    lines.push("");
    for (const child of section.children) {
      lines.push(`- ${child.path} - ${child.label}: ${child.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

const args = new Set(process.argv.slice(2));

if (args.has("--json")) {
  console.log(JSON.stringify(navigation, null, 2));
} else if (args.has("--markdown")) {
  console.log(asMarkdown());
} else {
  console.log("PrintFlow Navigation Map");
  console.log("========================");
  console.log(
    "This output mirrors the app routes in src/app/routes.tsx and explains where each path leads.",
  );
  console.log("");
  for (const section of navigation) {
    printNode(section);
    console.log("");
  }
  console.log("Usage:");
  console.log("  node scripts/navigation-map.mjs");
  console.log("  node scripts/navigation-map.mjs --markdown");
  console.log("  node scripts/navigation-map.mjs --json");
}
