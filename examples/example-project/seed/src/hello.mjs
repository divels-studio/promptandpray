// The whole "product" of the example project. It exists so the configured VERIFY command
// (`node --check src/hello.mjs`) is a real command against a real file, not a placeholder.
export function hello(name) {
  return `hello, ${name}`;
}

console.log(hello('example'));
