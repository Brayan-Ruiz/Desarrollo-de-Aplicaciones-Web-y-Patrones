package com.tiendaTech.tienda.repository;

import com.tiendaTech.tienda.domain.Producto;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    public List<Producto> findByActivoTrue();

    //Ejemplo de método utilizando consultas derivadas
    public List<Producto> findByPrecioBetweenOrderByPrecioAsc(BigDecimal precioInf, BigDecimal precioSup);

    //Ejemplo de método utilizando consultas JPQL
    @Query(value = "SELECT p FROM Producto p WHERE p.precio BETWEEN :precioInf AND :precioSup ORDER BY p.precio ASC")
    public List<Producto> consultaJPQL(@Param("precioInf") BigDecimal precioInf, @Param("precioSup") BigDecimal precioSup);

    //Ejemplo de método utilizando consultas SQL nativas
    @Query(nativeQuery = true,
            value = "SELECT * FROM producto p WHERE p.precio BETWEEN :precioInf AND :precioSup ORDER BY p.precio ASC")
    public List<Producto> consultaSQL(@Param("precioInf") BigDecimal precioInf, @Param("precioSup") BigDecimal precioSup);
    
    //Consulta de recuperacion de los productos creados en un rango de fechas
    @Query(value = "SELECT p FROM Producto p WHERE p.fechaCreacion BETWEEN :fechaInf AND :fechaSup ORDER BY p.fechaCreacion ASC")
    public List<Producto> consultaPorFecha(@Param("fechaInf") LocalDate fechaInf, @Param("fechaSup") LocalDate fechaSup);
}