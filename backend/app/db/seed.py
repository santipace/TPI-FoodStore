"""Seed idempotente: carga el admin, las categorias y los productos.

Ejecucion: python -m app.db.seed
Se puede correr todas las veces que haga falta: solo crea lo que no existe.
"""
from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Admin Food Store",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas de carne con papas"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (categoria, nombre, descripcion, precio, stock)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga, tomate y cheddar", 6500.0, 20),
    ("Hamburguesas", "Hamburguesa doble", "Doble carne, panceta y cheddar", 8200.0, 15),
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate y muzzarella", 9000.0, 12),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate fresco y ajo", 10500.0, 10),
    ("Bebidas", "Gaseosa 500 ml", "Cola, lima limón o naranja", 1800.0, 50),
    ("Bebidas", "Cerveza artesanal", "Rubia, 473 ml", 3200.0, 30),
    ("Postres", "Flan casero", "Con dulce de leche y crema", 3500.0, 18),
    ("Postres", "Brownie con helado", "Brownie tibio y bocha de crema americana", 4200.0, 14),
]


def run() -> None:
    create_all_tables()
    with session_factory() as session:
        if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            print(f"Usuario admin creado ({ADMIN['username']} / {ADMIN['password']})")

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                print(f"Categoria creada: {nombre}")
            categorias[nombre] = categoria

        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                categoria = categorias[cat_nombre]
                assert categoria.id is not None
                session.add(
                    Producto(
                        categoria_id=categoria.id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                    )
                )
                print(f"Producto creado: {nombre}")
        session.commit()
    print("Seed completo.")


if __name__ == "__main__":
    run()
