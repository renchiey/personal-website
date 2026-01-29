<template>
  <header>
    <nav>
      <ul>
        <li
          v-for="option in navLinks"
          :class="{ highlight: isActive(option.href) }"
        >
          <a class="nav-option-container" :href="option.href">
            <div class="icon" v-if="option.icon" v-html="option.icon" />
            <span class="nav-label"> {{ option.label }}</span></a
          >
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import terminalIcon from "../assets/terminal.svg?raw";
import homeIcon from "../assets/home.svg?raw";
import bookIcon from "../assets/book.svg?raw";
import hammerIcon from "../assets/hammer.svg?raw";
import { onMounted, ref } from "vue";

const path = ref("");

onMounted(() => {
  path.value = window.location.pathname;
});

function isActive(href: string) {
  // Exact match for home
  if (href === "/") {
    return path.value === "/";
  }

  // Prefix match for nested routes
  return path.value.startsWith(href);
}

const navLinks = [
  {
    label: "Terminal",
    href: "/terminal",
    icon: terminalIcon,
  },
  {
    label: "Home",
    href: "/",
    icon: homeIcon,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: hammerIcon,
  },
  {
    label: "Bookshelf",
    href: "/bookshelf",
    icon: bookIcon,
  },
];
</script>

<style scoped>
header {
  margin-bottom: 30px;
  margin-inline: 10px;
}

nav {
  display: flex;
  justify-content: center;
  align-items: center;
}

.highlight {
  background: white;
  color: black;
}

.highlight a {
  color: black;
}

ul {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  font-size: 1.2em;
  flex-wrap: wrap;
}

li {
  border: 2px solid white;
  padding: 3px 10px;
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

a {
  text-decoration: none;
  color: white;
  display: flex;
  gap: 10px;
}

@media only screen and (max-width: 600px) {
  .nav-label {
    display: none;
  }

  li {
    padding: 3px 5px;
  }

  .icon {
    width: 30px;
    height: 30px;
  }

  .icon :deep(svg) {
    width: 100%;
    height: 100%;
  }

  .nav-option-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
