<template>
  <header>
    <nav>
      <ul>
        <li v-for="option in navLinks">
          <a :href="option.href">
            <div class="icon" v-if="option.icon" v-html="option.icon" />
            {{ option.label }}</a
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
    label: "Reading",
    href: "/reading",
    icon: bookIcon,
  },
];
</script>

<style scoped>
nav {
  display: flex;
}

ul {
  list-style: none;
  display: flex;
  gap: 30px;
  font-size: 1.2em;
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
</style>
