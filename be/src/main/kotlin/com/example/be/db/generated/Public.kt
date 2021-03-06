/*
 * This file is generated by jOOQ.
 */
package com.example.be.db.generated


import com.example.be.db.generated.tables.Artist
import com.example.be.db.generated.tables.Config
import com.example.be.db.generated.tables.FlywaySchemaHistory

import javax.annotation.processing.Generated

import kotlin.collections.List

import org.jooq.Catalog
import org.jooq.Table
import org.jooq.impl.SchemaImpl


/**
 * This class is generated by jOOQ.
 */
@Generated(
    value = [
        "https://www.jooq.org",
        "jOOQ version:3.16.5"
    ],
    comments = "This class is generated by jOOQ"
)
@Suppress("UNCHECKED_CAST")
open class Public : SchemaImpl("public", DefaultCatalog.DEFAULT_CATALOG) {
    public companion object {

        /**
         * The reference instance of <code>public</code>
         */
        val PUBLIC: Public = Public()
    }

    /**
     * The table <code>public.artist</code>.
     */
    val ARTIST: Artist get() = Artist.ARTIST

    /**
     * The table <code>public.config</code>.
     */
    val CONFIG: Config get() = Config.CONFIG

    /**
     * The table <code>public.flyway_schema_history</code>.
     */
    val FLYWAY_SCHEMA_HISTORY: FlywaySchemaHistory get() = FlywaySchemaHistory.FLYWAY_SCHEMA_HISTORY

    override fun getCatalog(): Catalog = DefaultCatalog.DEFAULT_CATALOG

    override fun getTables(): List<Table<*>> = listOf(
        Artist.ARTIST,
        Config.CONFIG,
        FlywaySchemaHistory.FLYWAY_SCHEMA_HISTORY
    )
}
