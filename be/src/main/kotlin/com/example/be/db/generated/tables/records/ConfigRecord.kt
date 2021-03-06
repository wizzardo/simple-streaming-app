/*
 * This file is generated by jOOQ.
 */
package com.example.be.db.generated.tables.records


import com.example.be.db.generated.tables.Config

import java.time.LocalDateTime

import javax.annotation.processing.Generated

import org.jooq.Field
import org.jooq.JSONB
import org.jooq.Record1
import org.jooq.Record5
import org.jooq.Row5
import org.jooq.impl.UpdatableRecordImpl


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
open class ConfigRecord() : UpdatableRecordImpl<ConfigRecord>(Config.CONFIG), Record5<Long?, LocalDateTime?, LocalDateTime?, String?, JSONB?> {

    var id: Long?
        set(value): Unit = set(0, value)
        get(): Long? = get(0) as Long?

    var created: LocalDateTime?
        set(value): Unit = set(1, value)
        get(): LocalDateTime? = get(1) as LocalDateTime?

    var updated: LocalDateTime?
        set(value): Unit = set(2, value)
        get(): LocalDateTime? = get(2) as LocalDateTime?

    var name: String?
        set(value): Unit = set(3, value)
        get(): String? = get(3) as String?

    var `data`: JSONB?
        set(value): Unit = set(4, value)
        get(): JSONB? = get(4) as JSONB?

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    override fun key(): Record1<Long?> = super.key() as Record1<Long?>

    // -------------------------------------------------------------------------
    // Record5 type implementation
    // -------------------------------------------------------------------------

    override fun fieldsRow(): Row5<Long?, LocalDateTime?, LocalDateTime?, String?, JSONB?> = super.fieldsRow() as Row5<Long?, LocalDateTime?, LocalDateTime?, String?, JSONB?>
    override fun valuesRow(): Row5<Long?, LocalDateTime?, LocalDateTime?, String?, JSONB?> = super.valuesRow() as Row5<Long?, LocalDateTime?, LocalDateTime?, String?, JSONB?>
    override fun field1(): Field<Long?> = Config.CONFIG.ID
    override fun field2(): Field<LocalDateTime?> = Config.CONFIG.CREATED
    override fun field3(): Field<LocalDateTime?> = Config.CONFIG.UPDATED
    override fun field4(): Field<String?> = Config.CONFIG.NAME
    override fun field5(): Field<JSONB?> = Config.CONFIG.DATA
    override fun component1(): Long? = id
    override fun component2(): LocalDateTime? = created
    override fun component3(): LocalDateTime? = updated
    override fun component4(): String? = name
    override fun component5(): JSONB? = `data`
    override fun value1(): Long? = id
    override fun value2(): LocalDateTime? = created
    override fun value3(): LocalDateTime? = updated
    override fun value4(): String? = name
    override fun value5(): JSONB? = `data`

    override fun value1(value: Long?): ConfigRecord {
        this.id = value
        return this
    }

    override fun value2(value: LocalDateTime?): ConfigRecord {
        this.created = value
        return this
    }

    override fun value3(value: LocalDateTime?): ConfigRecord {
        this.updated = value
        return this
    }

    override fun value4(value: String?): ConfigRecord {
        this.name = value
        return this
    }

    override fun value5(value: JSONB?): ConfigRecord {
        this.`data` = value
        return this
    }

    override fun values(value1: Long?, value2: LocalDateTime?, value3: LocalDateTime?, value4: String?, value5: JSONB?): ConfigRecord {
        this.value1(value1)
        this.value2(value2)
        this.value3(value3)
        this.value4(value4)
        this.value5(value5)
        return this
    }

    /**
     * Create a detached, initialised ConfigRecord
     */
    constructor(id: Long? = null, created: LocalDateTime? = null, updated: LocalDateTime? = null, name: String? = null, `data`: JSONB? = null): this() {
        this.id = id
        this.created = created
        this.updated = updated
        this.name = name
        this.`data` = `data`
    }

    /**
     * Create a detached, initialised ConfigRecord
     */
    constructor(value: com.example.be.db.generated.tables.pojos.Config?): this() {
        if (value != null) {
            this.id = value.id
            this.created = value.created
            this.updated = value.updated
            this.name = value.name
            this.`data` = value.`data`
        }
    }
}
