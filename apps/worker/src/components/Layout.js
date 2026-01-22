import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { globalStyles } from '../styles';
export const Layout = ({ title, children }) => {
    return (_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsx("meta", { charset: "UTF-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), _jsxs("title", { children: [title, " | Task Manager"] }), _jsx("style", { children: globalStyles })] }), _jsx("body", { children: _jsxs("div", { class: "container", children: [_jsx("header", { class: "header", children: _jsxs("a", { href: "/", class: "logo", children: [_jsx("div", { class: "logo-icon", children: "\uD83D\uDCCB" }), _jsxs("div", { children: [_jsx("div", { class: "logo-text", children: "Task Manager" }), _jsx("div", { class: "logo-subtitle", children: "Powered by Cloudflare Workers" })] })] }) }), _jsx("main", { children: children })] }) })] }));
};
