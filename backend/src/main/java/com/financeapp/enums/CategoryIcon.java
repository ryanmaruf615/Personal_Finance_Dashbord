package com.financeapp.enums;

/**
 * Icons for transaction categories.
 * The frontend maps these to lucide-react icon names.
 * Each enum value stores the corresponding icon identifier.
 */
public enum CategoryIcon {
    FOOD("utensils"),
    TRANSPORT("car"),
    HOUSING("home"),
    SALARY("briefcase"),
    ENTERTAINMENT("film"),
    HEALTH("heart-pulse"),
    SHOPPING("shopping-bag"),
    UTILITIES("zap"),
    EDUCATION("graduation-cap"),
    TRAVEL("plane"),
    GIFT("gift"),
    OTHER("circle-dot");

    private final String iconName;

    CategoryIcon(String iconName) {
        this.iconName = iconName;
    }

    public String getIconName() {
        return iconName;
    }
}
