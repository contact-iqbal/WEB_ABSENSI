export const runtime = 'nodejs';

import mysql from 'mysql2';
import pool from '@/lib/db_no_promise';

export async function GET(req: Request) {
    //   if (
    //     req.headers.get('authorization') !==
    //     `Bearer ${process.env.ADMIN_SECRET}`
    //   ) {
    //     return new Response('Unauthorized', { status: 401 });
    //   }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                controller.enqueue(
                    encoder.encode(`
                        SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
                        SET time_zone = "+00:00";
                        SET FOREIGN_KEY_CHECKS = 0;

                        `)
                );

                // Get all tables
                const tables: any = await new Promise((resolve, reject) => {
                    pool.query('SHOW TABLES', (err: any, results: unknown) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (!tables.length) {
                    controller.close();
                    return;
                }

                const tableKey = Object.keys(tables[0])[0];

                for (const row of tables) {
                    const tableName = row[tableKey];

                    // DROP TABLE
                    controller.enqueue(
                        encoder.encode(
                            `DROP TABLE IF EXISTS \`${tableName}\`;\n`
                        )
                    );

                    // CREATE TABLE
                    const createTable: any = await new Promise(
                        (resolve, reject) => {
                            pool.query(
                                `SHOW CREATE TABLE \`${tableName}\``,
                                (err: any, results: unknown) => {
                                    if (err) reject(err);
                                    else resolve(results);
                                }
                            );
                        }
                    );

                    controller.enqueue(
                        encoder.encode(
                            createTable[0]['Create Table'] + ';\n\n'
                        )
                    );

                    // STREAM TABLE DATA
                    const query = pool.query(
                        `SELECT * FROM \`${tableName}\``
                    );

                    const queryStream = query.stream();

                    for await (const rowData of queryStream as any) {
                        const values = Object.values(rowData)
                            .map((val) =>
                                val === null
                                    ? 'NULL'
                                    : mysql.escape(val)
                            )
                            .join(',');

                        controller.enqueue(
                            encoder.encode(
                                `INSERT INTO \`${tableName}\` VALUES (${values});\n`
                            )
                        );
                    }

                    controller.enqueue(encoder.encode('\n'));
                }
                controller.enqueue(
                    encoder.encode(`
                        SET FOREIGN_KEY_CHECKS = 1;
                        `)
                );


                controller.close();
            } catch (err: any) {
                controller.error(err);
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/sql',
            'Content-Disposition':
                `attachment; filename=database.sql`,
        },
    });
}
