from mysql.connector import connect
from os import environ

class MysqlConnection():
    db_connection = None

    def __init__(self) -> None:
        self.db_connection = connect(
            host=environ.get("MYSQL_HOST", "localhost"),
            user=environ.get("MYSQL_ROOT_USER", "root"),
            password=environ.get("MYSQL_PASSWORD", "admin"),
            database=environ.get("MYSQL_DATABASE", "olvasosziget"),
            port=int(environ.get("MYSQL_PORT", "3306"))
        )

        print("Connected to MySQL!")

    def insert_row_to_table(self, table_name, columns, row_data):
        ...


db_conn = MysqlConnection()