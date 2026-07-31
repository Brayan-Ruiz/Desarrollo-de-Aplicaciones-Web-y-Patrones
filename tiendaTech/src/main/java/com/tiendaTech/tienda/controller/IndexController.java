package com.tiendaTech.tienda.controller;


import com.tiendaTech.tienda.service.CategoriaService;
import com.tiendaTech.tienda.service.ProductoService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class IndexController {

    private final ProductoService productoService;
    private final CategoriaService categoriaService;

    public IndexController(ProductoService productoService, CategoriaService categoriaService) {
        this.productoService = productoService;
        this.categoriaService = categoriaService;
    }

    @GetMapping("/")
    public String listado(Model model) {
        var productos = productoService.getProductos(false);
        model.addAttribute("productos", productos);
        var categorias = categoriaService.getCategorias(true);
        model.addAttribute("categorias", categorias);
        return "/index";
    }

    @GetMapping("/consultas/{idCategoria}")
        public String listado(@PathVariable("idCategoria") Integer idCategoria, Model model) {
            model.addAttribute("idCategoriaActual", idCategoria);
            var productos = productoService.getProductosPorCategoria(idCategoria);
            model.addAttribute("productos", productos);
            var categorias = categoriaService.getCategorias(true);
            model.addAttribute("categorias", categorias);
            return "/index";
        }

}