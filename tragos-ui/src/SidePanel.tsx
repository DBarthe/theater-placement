import React from 'react';
export function SidePanel() {
    return (
        <div className="side-panel bp3-card">
            <ul className="side-panel-tab-ul bp3-tab-list" role="tablist">
                <li className="side-panel-tab-li bp3-tab" role="tab" aria-selected="true">Réservations</li>
                <li className="side-panel-tab-li bp3-tab" role="tab">Sièges</li>
            </ul>
            <div className="side-panel-tab bp3-tab-panel" role="tabpanel">
                <ul className="side-list">
                    <li onClick={() => console.log("TODO clickable list")}>Landry Le Tenier</li>
                    <li>Barthélémy Delemotte</li>
                    <li>Pierre Hammard</li>
                    <li>Mathilde Rolland</li>
                    <li>Victoire Hoquet</li>
                    <li>Landry Le Tenier</li>
                    <li>Barthélémy Delemotte</li>
                    <li>Pierre Hammard</li>
                    <li>Mathilde Rolland</li>
                    <li>Victoire Hoquet</li>
                    <li>Landry Le Tenier</li>
                    <li>Barthélémy Delemotte</li>
                    <li>Pierre Hammard</li>
                    <li>Mathilde Rolland</li>
                    <li>Victoire Hoquet</li>
                    <li>Landry Le Tenier</li>
                    <li>Barthélémy Delemotte</li>
                    <li>Pierre Hammard</li>
                    <li>Mathilde Rolland</li>
                    <li>Victoire Hoquet</li>
                    <li>Landry Le Tenier</li>
                    <li>Barthélémy Delemotte</li>
                    <li>Pierre Hammard</li>
                    <li>Mathilde Rolland</li>
                    <li>Victoire Hoquet</li>
                </ul>
            </div>
        </div>

    );
}
