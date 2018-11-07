fabric.Atom = fabric.util.createClass(fabric.Circle, {
    type: "atom",
    originX: "center",
    originY: "center",
    hasControls: false,
    hasBorders: false,
    fill: '#fff',
    initialize: function (options) {
        console.log("ATOM OPTIONS");
        console.log(options);
        console.log(JSON.stringify(canvas));
        options || (options = {});
        this.callSuper('initialize', options);
        this.set({
            radius:20,
            posCharge: options.posCharge || false,
            negCharge: options.negCharge || false,
            hasPairs: options.hasPairs || false,
            hasRad: options.hasRad || false,
            electron_pairs: options.electron_pairs || 0,
            radicals: options.radicals || 0,
            charge_label: options.charge_label || "",
            charge_count: options.charge_count || 0,
            stroke: 'white',
            strokeWidth: 1,
            left: options.left,
            top:  options.top,
            atom_id: options.atom_id || '',
            atom_type: options.atom_type || '',
            num_bonds: options.num_bonds || 0,
            bonds: options.bonds || []
        });
        this.image = options.img;
        this.img = new Image();
        this.img.onload = function () {
            this.loaded = true;
            this.fire('image:loaded');
            console.log("image loaded");
        }.bind(this);
        this.img.src = options.img;
        console.log(Math.floor(-this.img.height / 2) - 4);
        this.on("moving", function (e) {
            switch (canvas.canvas_mode){
                case "NONE":
                    this.set('stroke','#C6BBBB');
                    break;
                case "BOND":
                    this.set('stroke', 'red')
            }
            var _canvas = this.canvas;
            if (this.num_bonds > 0) {
                for (var i = 0; i < this.num_bonds; i++) {
                    var _bond = canvas.getBondByID(this.bonds[i]);
                    if (this.atom_id === _bond.atom1_id) {
                        _bond.set({x1: this.left, y1: this.top}).setCoords();
                    } else {
                        _bond.set({x2: this.left, y2: this.top}).setCoords();
                    }
                    _canvas.renderAll();
                }
            }
        });
        this.on('mouseup', function (e) {
            switch (canvas.canvas_mode){
                case "NONE":
                    this.set('stroke','white');
                    break;
                case "CHARGE":
                    this.set('stroke', 'white');
                    canvas.renderAll();
            }
        });
        this.on('mousedown', function(e){
            console.log(this);
            console.log("Atom_ID:");
            console.log(canvas.getActiveObject().atom_id);
            switch (canvas.canvas_mode){
                case "NONE":
                    break;
                case "BOND":
                    this.set("stroke", 'red');
                    if (canvas.BondTool.count === 0){
                        canvas.BondTool.count += 1;
                        canvas.BondTool.atom1 = this;
                    } else {
                        canvas.BondTool.count += 1;
                        canvas.BondTool.atom2 = this;
                        canvas.BondTool.Bond();
                        canvas.renderAll();
                    }
                    break;
                case "POSCHARGE":
                    this.addCharge();
                    canvas.renderAll();
                    break;
                case "NEGCHARGE":
                    this.addCharge();
                    canvas.renderAll();
                    break;
                case "ELEC":
                    if (this.hasRad){
                        this.hasRad = false;
                    }
                    if (this.electron_pairs === 3){
                        this.hasPairs = false;
                        this.electron_pairs = 0;
                        canvas.renderAll();
                        return;
                    }
                    this.hasPairs = true;
                    this.electron_pairs += 1;
                    canvas.renderAll();
                    break;
                case "RAD":
                    if (this.hasPairs){
                        this.electron_pairs = 0;
                        this.hasPairs = false;
                    }
                    if (this.hasRad){
                        this.hasRad = false;
                        this.radicals = 0;
                        canvas.renderAll();
                        return;
                    }
                    this.hasRad = true;
                    this.radicals += 1;
                    canvas.renderAll();
                    break;
                case "DELETE":
                    if (this.num_bonds > 0){
                        this.bonds.forEach(function (element) {
                            var _bond = canvas.getBondByID(element);
                            _bond.deleteBond(element);
                        });
                    }
                    canvas.deleteAtomTool(this.atom_id);
            }
        });
    },
    toObject: function() {
        return {
            type: this.type,
            atom_id: this.atom_id,
            atom_type: this.atom_type,
            left: this.left,
            top: this.top,
            img: this.image,
            num_bonds: this.num_bonds,
            bonds: this.bonds,
            charge_label: this.charge_label,
            hasPairs: this.hasPairs,
            hasRad: this.hasRad,
            electron_pairs: this.electron_pairs,
            radicals: this.radicals,
            posCharge: this.posCharge,
            negCharge: this.negCharge,
            charge_count: this.charge_count
        }
    },
    _render: function(ctx) {
        this.callSuper('_render', ctx);
        ctx.drawImage(this.img, -this.img.height / 2, -this.img.width / 2 );
        this.makeCharges(ctx);
        this.makeElectrons(ctx)
    },
    BondTo: function(bond) { //Function that handles the bonds[] array of Atom
        var _bond_id = bond.bond_id;
        if (this.num_bonds >= 5){ //Max bonds possible = 5
            canvas.remove(_bond_id);
            canvas.renderAll();
        } else {
            this.bonds.push(_bond_id);
            this.num_bonds += 1;
            console.log("BONDS: " + this.bonds[_bond_id]);
        }
    },
    removeBond: function (bond_id) {
        if (this.num_bonds > 0){
            var _index = this.bonds.indexOf(bond_id);
            this.bonds.splice(_index, 1);
            this.num_bonds -= 1;
        } else {
            console.log("atom has no bonds!")
        }
    },
    addCharge: function () {
        if (canvas.canvas_mode === "POSCHARGE"){
            if (this.negCharge){
                this.negCharge = false;
                this.charge_count = 0;
            }
            this.posCharge = true;
            switch (this.charge_count){
                case 0:
                    this.charge_label = "+";
                    this.charge_count = 1;
                    canvas.renderAll();
                    break;
                case 1:
                    this.charge_label = "+2";
                    this.charge_count += 1;
                    canvas.renderAll();
                    break;
                case 2:
                    this.charge_label = "+3";
                    this.charge_count += 1;
                    canvas.renderAll();
                    break;
                case 3:
                    this.charge_label = "+4";
                    this.charge_count += 1;
                    canvas.renderAll();
                    break;
                case 4:
                    this.charge_label = "";
                    this.charge_count = 0;
                    this.posCharge = false;
                    canvas.renderAll();
            }
        } else {
            if (canvas.canvas_mode === "NEGCHARGE"){
                if (this.posCharge){
                    this.posCharge = false;
                    this.charge_count = 0;
                }
                this.posCharge = false;
                this.negCharge = true;
                switch (this.charge_count){
                    case 0:
                        this.charge_label = "-";
                        this.charge_count = 1;
                        canvas.renderAll();
                        break;
                    case 1:
                        this.charge_label = "-2";
                        this.charge_count += 1;
                        canvas.renderAll();
                        break;
                    case 2:
                        this.charge_label = "-3";
                        this.charge_count += 1;
                        canvas.renderAll();
                        break;
                    case 3:
                        this.charge_label = "-4";
                        this.charge_count += 1;
                        canvas.renderAll();
                        break;
                    case 4:
                        this.charge_label = "";
                        this.charge_count = 0;
                        this.negCharge = false;
                        canvas.renderAll();
                }
            }
        }
    },
    makeCharges: function (ctx) {
        if (this.posCharge || this.negCharge){
            ctx.fillStyle = '#333';
            if (this.charge_count === 1){
                ctx.font = "15px Helvetica";
            } else {
                ctx.font = "10px Helvetica";
            }
            ctx.fillText(this.charge_label, this.width / 2 - 13, -this.height / 2 + 13);
        }

    },
    makeElectrons: function (ctx) {
        var makeElectron = function (ctx, x, y) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2*Math.PI);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.fillStyle = "#000000";
            ctx.fill();
        };
        if(this.hasPairs && !this.hasRad) {
            switch (this.electron_pairs) {
                case 1:
                    makeElectron(ctx, Math.floor(this.img.width / 2) - 5, (-this.img.height / 2) - 4);
                    makeElectron(ctx, Math.ceil(-this.img.height / 2) + 5, (-this.img.height / 2) - 4);
                    break;
                case 2:
                    if (this.posCharge || this.negCharge){
                        makeElectron(ctx, 2, (-this.img.height / 2) - 4);
                        makeElectron(ctx, -2, (-this.img.height / 2) - 4);
                        makeElectron(ctx, 12, -2);
                        makeElectron(ctx, 12, 2);
                    } else {
                        makeElectron(ctx, 9, (-this.img.height / 2) - 1);
                        makeElectron(ctx, 5, (-this.img.height / 2) - 3);
                        makeElectron(ctx, -9, (-this.img.height / 2) - 1);
                        makeElectron(ctx, -5, (-this.img.height / 2) - 3);
                    }
                    break;
                case 3:
                    makeElectron(ctx, 2, (-this.img.height / 2) - 4);
                    makeElectron(ctx, -2, (-this.img.height / 2) - 4);
                    makeElectron(ctx, 12, Math.ceil(-this.img.height / 2) + 5);
                    makeElectron(ctx, 12, Math.floor(this.img.height / 2) - 5);
                    makeElectron(ctx, -12, Math.ceil(-this.img.height / 2) + 5);
                    makeElectron(ctx, -12, Math.floor(this.img.height / 2) - 5);
            }
        }
        if (this.hasRad && !this.hasPairs){
            makeElectron(ctx, (-this.img.width / 2) - 4, 0);
        }
    },
    isBondedTo: function (_atom_id) {
        for (var i = 0; i < this.num_bonds; i++){
            var _bond = canvas.getBondByID(this.bonds[i]);
            if (_bond.atom1_id === _atom_id || _bond.atom2_id === _atom_id){
                console.log("Error: Atoms are already bonded");
                return true
            } else {
                return false
            }
        }
    }
});

fabric.Bond = fabric.util.createClass(fabric.Line, {
    type: "bond",
    originX: "center",
    originY: "center",
    stroke: 'black',
    strokeWidth: 2,
    selectable: false,
    hasBorders: false,
    perPixelTargetFind: true,
    hasControls: false,
    initialize: function (options) {
        options || (options = {});
        var _canvas = canvas;
        var _atom1 = _canvas.getAtomByID(options.atoms[0]);
        var _atom2 = _canvas.getAtomByID(options.atoms[1]);
        this.callSuper('initialize', [_atom1.left, _atom1.top, _atom2.left, _atom2.top], options);
        this.atom1_id = options.atoms[0];
        this.atom2_id = options.atoms[1];
        this.bond_id = options.bond_id || '';
        this.bond_type = options.bond_type || 'single';
        this.on('mousedown', function (e) {
            console.log("Bond Click")
            if(canvas.canvas_mode === "BOND"){
                switch (this.bond_type){
                    case "single":
                        this.bond_type = "double";
                        break;
                    case "double":
                        this.bond_type = "triple";
                        break;
                    case "triple":
                        this.bond_type = "quad";
                        break;
                    case "quad":
                        this.bond_type = "single";
                        break;
                }
            } else if (canvas.canvas_mode === "DELETE"){
                this.deleteBond(this.bond_id);
            }
        });
    },
    toObject: function () {
        return {
            type: this.type,
            bond_id: this.bond_id,
            bond_type: this.bond_type,
            atoms: [this.atom1_id, this.atom2_id],
            x1: this.x1,
            y1: this.y1,
            x2: this.x2,
            y2: this.y2
        };
    },
    findOrientation: function () {
        var _atom1 = canvas.getAtomByID(this.atom1_id);
        var _atom2 = canvas.getAtomByID(this.atom2_id);
        return (_atom1.top - _atom2.top) / (_atom1.left - _atom2.left);
    },
    makeLines: function (ctx) {
        var _sign;
        if (this.findOrientation() === Infinity || this.findOrientation() === -Infinity){
            _sign = 1;
        }
        if (this.findOrientation() > 0){
            _sign = 1;
        }
        if (this.findOrientation() < 0 || this.findOrientation() < 0 && !-Infinity){
            _sign = -1;
        }
        if (this.findOrientation() === 0){
            _sign = 1;
        }
        console.log(_sign);
            switch (this.bond_type){
            case "single":
                break;
            case "double":
                ctx.beginPath();
                ctx.moveTo((-this.width / 2 + 4), ((-this.height*_sign) / 2 - (_sign*4)));
                ctx.lineTo((this.width / 2 + 4), ((this.height*_sign) / 2 - (_sign*4)));
                ctx.stroke();
                break;
            case "triple":
                ctx.beginPath();
                ctx.moveTo((-this.width / 2 + 4), ((-this.height*_sign) / 2 - (_sign*4)));
                ctx.lineTo((this.width / 2 + 4), ((this.height*_sign) / 2 - (_sign*4)));
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo((-this.width / 2) - 4, ((-this.height*_sign) / 2) + (_sign*4));
                ctx.lineTo((this.width / 2) - 4, ((this.height*_sign) / 2) + (_sign*4));
                ctx.stroke();
                break;
            case "quad":
                ctx.beginPath();
                ctx.moveTo((-this.width / 2 + 4), ((-this.height*_sign) / 2 - (_sign*4)));
                ctx.lineTo((this.width / 2 + 4), ((this.height*_sign) / 2 - (_sign*4)));
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo((-this.width / 2) - 4, ((-this.height*_sign) / 2) + (_sign*4));
                ctx.lineTo((this.width / 2) - 4, ((this.height*_sign) / 2) + (_sign*4));
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo((-this.width / 2) + 8, ((-this.height*_sign) / 2) - (_sign*8));
                ctx.lineTo((this.width / 2) + 8, ((this.height*_sign) / 2) - (_sign*8));
                ctx.stroke();
        }
    },
    deleteBond: function (bond_id) {
        var _canvas = this.canvas;
        var _atom1 = canvas.getAtomByID(this.atom1_id);
        var _atom2 = canvas.getAtomByID(this.atom2_id);
        _atom1.removeBond(bond_id);
        _atom2.removeBond(bond_id);
        _canvas.remove(this);
        switch (this.bond_type){
            case "single":
                break;
            case "double":
                break;
            case "triple":
                break;
            case "quad":
                break;
        }
    },
    _render: function (ctx) {
        this.callSuper('_render', ctx);
        this.makeLines(ctx);
    }
});
fabric.Bond.fromObject = function(object, callback, forceAsync) {
    return fabric.Object._fromObject('Bond', object, function(bond){
        canvas.add(bond);
        canvas.sendToBack(bond);
        canvas.renderAll()
    }, forceAsync);
};

fabric.Atom.fromObject = function(object, callback, forceAsync) {
    return fabric.Object._fromObject('Atom', object, function (atom) {
        canvas.add(atom);
        canvas.renderAll();
    }, forceAsync);
};