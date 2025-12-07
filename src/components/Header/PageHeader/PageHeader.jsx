import React from "react";
import { Button } from "antd";
import { iconMap } from "../../../utils/iconMap";
import styles from "./PageHeader.module.css";

export default function PageHeader({ title, subtitle, actions = [] }) {

    return (
        <div className={styles.header}>
            <div className={styles.texts}>
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            {actions?.length > 0 && (
                <div className={styles.actions}>
                    {actions.map((btn, index) => {
                        const Icon = btn.icon ? iconMap[btn.icon] : null;

                        return (
                            <Button
                                key={index}
                                type={btn.type || "default"}
                                onClick={btn.onClick}
                                className={styles.actionButton}
                                icon={Icon ? <Icon size={16} /> : null}
                            >
                                {btn.label}
                            </Button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
