var codeStore = {
	ins: {
		type: 'java',
		code: `
	import java.lang.reflect.*;
	import java.util.ArrayList;
	import java.util.Arrays;
	import java.util.LinkedList;
	import java.util.List;

	public class Inspector{

	    static final String[] PRIMITIVE_TYPE_NAMES = {"byte", "int", "short","long","boolean","double","float","char"};
	    static LinkedList &ltObject&gt checked_things = new LinkedList&lt&gt();


	    public void inspect(Object obj, boolean recursive){
	        if(obj == null){
	            //System.out.println("    Cannot inspect a null object");
	            return;
	        }
	        if(checked_things.contains(obj)){
	            System.out.println("#### ALREADY INSPECTED " + obj + ". CONTINUING... ####");
	            return;
	        }
	        System.out.println("#### Currently Inspecting: " + obj + " with recursive set to: " + recursive + " ####\\n");

	        LinkedList toCheckRecursively = new LinkedList();
	        Class classObj = obj.getClass();

	        if(!classObj.isArray()){

	            inspectNonArray(classObj, obj, toCheckRecursively);

	            if(classObj.getSuperclass() != null){

	                inspectSuperClassDetails(classObj, obj, toCheckRecursively);
	            }
	            if(classObj.isInterface()) {
	                Class[] interf = classObj.getInterfaces();

	                for (int i = 0; i &lt interf.length; i++) {
	                    inspectSuperInterfaces(classObj, interf[i], toCheckRecursively);
	                }

	            }
	            if(recursive){
	                System.out.println("#### Inspecting Recursive Fields & Objects for: " + obj + " ####");

	                recursiveInspection(obj, recursive, toCheckRecursively);
	            }
	            checked_things.add(obj);
	        }
	        else{
	            inspectArray(obj, recursive);
	        }
	    }

	    private void inspectArray(Object obj, boolean recursive) {
	        boolean skipPrimitive = false;
	        Class componentName = obj.getClass().getComponentType();
	        for(int j = 0; j &lt PRIMITIVE_TYPE_NAMES.length ; j++) {
	            if (PRIMITIVE_TYPE_NAMES[j].equals(componentName.getName())) {
	                // we have an array of primitive type
	                System.out.print("    FOUND PRIMITIVE ARRAY OF TYPE: " + componentName + " WITH VALUES: {");
	                ArrayList&ltString&gt foundPrimitives = new ArrayList&lt&gt();
	                for (int i = 0; i &lt Array.getLength(obj); i++) {
	                    foundPrimitives.add(""  + Array.get(obj, i));
	                }
	                System.out.println(String.join(",", foundPrimitives) + "}\\n\\n");

	                skipPrimitive = true;
	            }
	        }
	        if(!skipPrimitive) {
	            for(int i = 0; i &lt Array.getLength(obj); i++) {
	                inspect(Array.get(obj, i), recursive);
	            }
	        }
	    }

	    private void inspectSuperInterfaces(Class classObj, Class interf, LinkedList toCheckRecursively) {
	        String supersMethods = inspectMethods(interf);
	        String supersConstructors = inspectConstructors(interf);
	        String supersFields = inspectFields(interf, classObj, toCheckRecursively);

	        printInterfaceDetails(interf, supersMethods, supersConstructors, supersFields);
	    }

	    private void inspectSuperClassDetails(Class classObj, Object obj, LinkedList toCheckRecursively) {
	        String supersMethods = inspectMethods(classObj.getSuperclass());
	        String supersConstructors = inspectConstructors(classObj.getSuperclass());
	        String supersFields = inspectFields(classObj.getSuperclass(), classObj, toCheckRecursively);

	        printSuperClassDetails(classObj, supersMethods, supersConstructors, supersFields);
	    }

	    private void inspectNonArray(Class classObj, Object obj, LinkedList toCheckRecursively) {
	        String declaringClass = inspectDeclaringClass(classObj);
	        String immediateSuperClass = inspectImmediateSuperClass(classObj);
	        String className = classObj.getName();
	        String interfaces = inspectInterfaces(classObj);
	        String methods = inspectMethods(classObj);
	        String constructors = inspectConstructors(classObj);
	        String fields = inspectFields(classObj, obj, toCheckRecursively);

	        printClassObjDetails(declaringClass, immediateSuperClass, className, interfaces, methods, constructors, fields);
	    }

	    private void printInterfaceDetails(Class interf, String supersMethods, String supersConstructors, String supersFields) {
	        System.out.println("#### Inspecting SuperInterface ####\\n");
	        System.out.println("#### Inspecting SuperInterface Methods ####");
	        System.out.println("    Methods for " + interf.getName() + " are: \\n         " + supersMethods + "\\n\\n");
	        System.out.println("#### Inspecting SuperClass Constructors ####");
	        System.out.println("    Constructors for " + interf.getName() + " are: \\n     " + supersConstructors + "\\n\\n");
	        System.out.println("#### Inspecting SuperClass Fields ####");
	        System.out.println("    Fields for " + interf.getName() + " are: " + supersFields + "\\n\\n");
	    }

	    private void printSuperClassDetails(Class classObj, String supersMethods, String supersConstructors, String supersFields) {
	        System.out.println("#### Inspecting SuperClass ####\\n");
	        System.out.println("#### Inspecting SuperClass Methods ####");
	        System.out.println("    Methods for " + classObj.getSuperclass().getName() + " are: \\n         " + supersMethods + "\\n\\n");
	        System.out.println("#### Inspecting SuperClass Constructors ####");
	        System.out.println("    Constructors for " + classObj.getSuperclass().getName() + " are: \\n         " + supersConstructors + "\\n\\n");
	        System.out.println("#### Inspecting SuperClass Fields ####");
	        System.out.println("    Fields for " + classObj.getSuperclass().getName() + " are: " + supersFields + "\\n\\n");
	    }

	    private void printClassObjDetails(String declaringClass, String immediateSuperClass, String className, String interfaces, String methods, String constructors, String fields) {
	        System.out.println("#### Inspecting Declaring Class ####");
	        System.out.println("    Declaring Class for " + className + " is: " + declaringClass + "\\n\\n");
	        System.out.println("#### Inspecting Super Class ####");
	        System.out.println("    Super Class for " + className + " is: " + immediateSuperClass + "\\n\\n");
	        System.out.println("#### Inspecting Interfaces ####");
	        System.out.println("    Interfaces for " + className + " are: " + interfaces + "\\n\\n");
	        System.out.println("#### Inspecting Methods ####");
	        System.out.println("    Methods for " + className + " are: \\n         " + methods + "\\n\\n");
	        System.out.println("#### Inspecting Constructors ####");
	        System.out.println("    Constructors for " + className + " are: \\n         " + constructors + "\\n\\n");
	        System.out.println("#### Inspecting Fields ####");
	        System.out.println("    Fields for " + className + " are: \\n         " + fields + "\\n\\n");
	    }

	    public void recursiveInspection(Object obj, boolean recursive, LinkedList toCheckRecursively){
	        if(toCheckRecursively.size() == 0){
	            System.out.println("    Nothing to inspect. Continuing...");
	            return;
	        }
	        for(int i = 0; i &lt toCheckRecursively.size(); i++){
	            Field field = (Field) toCheckRecursively.get(i);
	            field.setAccessible(true);
	            System.out.println("    #### Currently inspecting " + field.getName() + " ####\\n");
	            try {
	                inspect(field.get(obj), recursive);
	                checked_things.add(obj);
	            }
	            catch(NullPointerException e){
	                System.out.println("    COULD NOT GET NULL FROM OBJECT. CONTINUING...");
	            }
	            catch(IllegalAccessException e){
	                System.out.println("    COULD NOT ACCESS FIELD FROM OBJECT. CONTINUING...");
	            }
	        }
	    }

	    public String inspectFields(Class classObj, Object obj, LinkedList toCheckRecursively){
	        String fieldsResult = "";
	        Field[] fields = classObj.getDeclaredFields();
	        for(int i = 0; i &lt fields.length; i++){
	            fields[i].setAccessible(true);
	            if(!fields[i].getType().isPrimitive() && fields[i] != null){
	                toCheckRecursively.add(fields[i]);
	            }
	            String type = fields[i].getType().getName();
	            String modifier = Modifier.toString(fields[i].getModifiers());
	            fieldsResult = fieldsResult + "\\n";
	            fieldsResult = fieldsResult + "         " + fields[i].getName() + "\\n";
	            fieldsResult = fieldsResult + "             type: " + type + "\\n";
	            fieldsResult = fieldsResult + "             modifiers: " + modifier + "\\n";
	            try {
	                fieldsResult = fieldsResult + "             value: " + fields[i].get(obj);
	            }
	            catch(Exception e){
	                fieldsResult = fieldsResult + "             Could not get value due to permissions";
	            }
	            if(fields[i].getType().isArray()){
	                fieldsResult = fieldsResult + "\\n";
	                fieldsResult = fieldsResult + "         " + fields[i].getName() + " is an array with the following properties: \\n";
	                fieldsResult = fieldsResult + "             Contains Type: " + fields[i].getType().getComponentType().getName() + "\\n";
	                try {
	                    fieldsResult = fieldsResult + "             Length: " + Array.getLength(fields[i].get(obj)) +"\\n";
	                }
	                catch (Exception e){
	                    fieldsResult = fieldsResult + "             Could not access length\\n";
	                }
	                fieldsResult = fieldsResult + "             Elements: {";
	                try {
	                    for (int j = 0; j &lt Array.getLength(fields[i].get(obj)); j++) {
	                        Object ele = Array.get(fields[i].get(obj), j);
	                        fieldsResult = fieldsResult + ele + ", ";

	                    }
	                    if(Array.getLength(fields[i].get(obj)) != 0){
	                        fieldsResult = fieldsResult.trim();
	                        fieldsResult = fieldsResult.substring(0, fieldsResult.length() - 1);
	                    }
	                    fieldsResult = fieldsResult + "}";

	                }
	                catch(IllegalArgumentException e){
	                    e.printStackTrace();
	                    fieldsResult = fieldsResult + "Expected Array: got type " + fields[i].getType() + "}".toUpperCase();
	                }
	                catch(IllegalAccessException e){
	                    fieldsResult = fieldsResult + "Could not access elements}".toUpperCase();
	                }
	            }
	        }

	        return fieldsResult;
	    }

	    public String inspectConstructors(Class classObj){
	        String constrResult = "";
	        Constructor[] cArr = classObj.getConstructors();
	        for(int i = 0; i &lt cArr.length; i++){
	            cArr[i].setAccessible(true);
	            Class[] params = cArr[i].getParameterTypes();
	            String modifies = Modifier.toString(cArr[i].getModifiers());
	            constrResult = constrResult + "\\n";
	            constrResult = constrResult + "         " + cArr[i].getName() + "(";
	            for(int j = 0; j &lt params.length; j++){
	                constrResult = constrResult + params[j].getName() + ", ";
	            }
	            if(params.length != 0){
	                constrResult = constrResult.trim();
	                constrResult = constrResult.substring(0, constrResult.length() - 1);
	            }
	            constrResult = constrResult + ")\\n";
	            constrResult = constrResult + "           with modifiers: " + modifies;
	        }

	        return constrResult;
	    }

	    public String inspectMethods(Class classObj){
	        String methodsResult = "";
	        Method[] mArr = classObj.getMethods();
	        for(int i = 0; i &lt mArr.length; i++){
	            mArr[i].setAccessible(true);
	            Class[] execps = mArr[i].getExceptionTypes();
	            Class[] params = mArr[i].getParameterTypes();
	            Class rtype = mArr[i].getReturnType();
	            String modifies = Modifier.toString(mArr[i].getModifiers());
	            methodsResult = methodsResult + "\\n";
	            methodsResult = methodsResult + "         " + mArr[i].getName() + "\\n";
	            methodsResult = methodsResult + "             exceptions: ";
	            for(int j = 0; j &lt execps.length; j++){
	                methodsResult = methodsResult + execps[j].getName() + ", ";
	            }
	            if (execps.length != 0) {
	                methodsResult = methodsResult.trim();
	                methodsResult = methodsResult.substring(0, methodsResult.length() - 1);
	            }
	            methodsResult = methodsResult + "\\n             parameters: ";
	            for(int j = 0; j &lt params.length; j++){
	                methodsResult = methodsResult + params[j].getName() + ", ";
	            }
	            if(params.length != 0){
	                methodsResult = methodsResult.trim();
	                methodsResult = methodsResult.substring(0, methodsResult.length() - 1);
	            }
	            methodsResult = methodsResult + "\\n             return type: ";
	            methodsResult = methodsResult + rtype.getName();
	            methodsResult = methodsResult + "\\n             modifiers: ";
	            methodsResult = methodsResult + modifies;
	        }

	        return methodsResult;
	    }

	    public String inspectInterfaces(Class classObj) {
	        Class[] interArr = classObj.getInterfaces();
	        String interfaceResult = "";
	        if(interArr.length &lt 1){
	            return "No implemented interfaces";
	        }
	        else{
	            for(int i = 0; i &lt interArr.length; i++){
	                interfaceResult = interfaceResult + interArr[i].getName() + ", ";
	            }
	            interfaceResult = interfaceResult.trim();
	            interfaceResult = interfaceResult.substring(0, interfaceResult.length() - 1);
	            return interfaceResult;
	        }
	    }

	    public String inspectDeclaringClass(Class classObj){
	        return classObj.getName();
	    }

	    public String inspectImmediateSuperClass(Class classObj){
	        return classObj.getSuperclass().getName();
	    }
	}import java.lang.reflect.*;
	import java.util.ArrayList;
	import java.util.Arrays;
	import java.util.LinkedList;
	import java.util.List;

	public class Inspector{

	    static final String[] PRIMITIVE_TYPE_NAMES = {"byte", "int", "short","long","boolean","double","float","char"};
	    static LinkedList &ltObject&gt checked_things = new LinkedList&lt&gt();


	    public void inspect(Object obj, boolean recursive){
	        if(obj == null){
	            //System.out.println("    Cannot inspect a null object");
	            return;
	        }
	        if(checked_things.contains(obj)){
	            System.out.println("#### ALREADY INSPECTED " + obj + ". CONTINUING... ####");
	            return;
	        }
	        System.out.println("#### Currently Inspecting: " + obj + " with recursive set to: " + recursive + " ####\\n");

	        LinkedList toCheckRecursively = new LinkedList();
	        Class classObj = obj.getClass();

	        if(!classObj.isArray()){

	            inspectNonArray(classObj, obj, toCheckRecursively);

	            if(classObj.getSuperclass() != null){

	                inspectSuperClassDetails(classObj, obj, toCheckRecursively);
	            }
	            if(classObj.isInterface()) {
	                Class[] interf = classObj.getInterfaces();

	                for (int i = 0; i &lt interf.length; i++) {
	                    inspectSuperInterfaces(classObj, interf[i], toCheckRecursively);
	                }

	            }
	            if(recursive){
	                System.out.println("#### Inspecting Recursive Fields & Objects for: " + obj + " ####");

	                recursiveInspection(obj, recursive, toCheckRecursively);
	            }
	            checked_things.add(obj);
	        }
	        else{
	            inspectArray(obj, recursive);
	        }
	    }

	    private void inspectArray(Object obj, boolean recursive) {
	        boolean skipPrimitive = false;
	        Class componentName = obj.getClass().getComponentType();
	        for(int j = 0; j &lt PRIMITIVE_TYPE_NAMES.length ; j++) {
	            if (PRIMITIVE_TYPE_NAMES[j].equals(componentName.getName())) {
	                // we have an array of primitive type
	                System.out.print("    FOUND PRIMITIVE ARRAY OF TYPE: " + componentName + " WITH VALUES: {");
	                ArrayList&ltString&gt foundPrimitives = new ArrayList&lt&gt();
	                for (int i = 0; i &lt Array.getLength(obj); i++) {
	                    foundPrimitives.add(""  + Array.get(obj, i));
	                }
	                System.out.println(String.join(",", foundPrimitives) + "}\\n\\n");

	                skipPrimitive = true;
	            }
	        }
	        if(!skipPrimitive) {
	            for(int i = 0; i &lt Array.getLength(obj); i++) {
	                inspect(Array.get(obj, i), recursive);
	            }
	        }
	    }

	    private void inspectSuperInterfaces(Class classObj, Class interf, LinkedList toCheckRecursively) {
	        String supersMethods = inspectMethods(interf);
	        String supersConstructors = inspectConstructors(interf);
	        String supersFields = inspectFields(interf, classObj, toCheckRecursively);

	        printInterfaceDetails(interf, supersMethods, supersConstructors, supersFields);
	    }

	    private void inspectSuperClassDetails(Class classObj, Object obj, LinkedList toCheckRecursively) {
	        String supersMethods = inspectMethods(classObj.getSuperclass());
	        String supersConstructors = inspectConstructors(classObj.getSuperclass());
	        String supersFields = inspectFields(classObj.getSuperclass(), classObj, toCheckRecursively);

	        printSuperClassDetails(classObj, supersMethods, supersConstructors, supersFields);
	    }

	    private void inspectNonArray(Class classObj, Object obj, LinkedList toCheckRecursively) {
	        String declaringClass = inspectDeclaringClass(classObj);
	        String immediateSuperClass = inspectImmediateSuperClass(classObj);
	        String className = classObj.getName();
	        String interfaces = inspectInterfaces(classObj);
	        String methods = inspectMethods(classObj);
	        String constructors = inspectConstructors(classObj);
	        String fields = inspectFields(classObj, obj, toCheckRecursively);

	        printClassObjDetails(declaringClass, immediateSuperClass, className, interfaces, methods, constructors, fields);
	    }

	    private void printInterfaceDetails(Class interf, String supersMethods, String supersConstructors, String supersFields) {
	        System.out.println("#### Inspecting SuperInterface ####\\n");
	        System.out.println("#### Inspecting SuperInterface Methods ####");
	        System.out.println("    Methods for " + interf.getName() + " are: \\n         " + supersMethods + "\\n\\n");
	        System.out.println("#### Inspecting SuperClass Constructors ####");
	        System.out.println("    Constructors for " + interf.getName() + " are: \\n     " + supersConstructors + "\\n\\n");
	        System.out.println("#### Inspecting SuperClass Fields ####");
	        System.out.println("    Fields for " + interf.getName() + " are: " + supersFields + "\\n\\n");
	    }

	    private void printSuperClassDetails(Class classObj, String supersMethods, String supersConstructors, String supersFields) {
	        System.out.println("#### Inspecting SuperClass ####\\n");
	        System.out.println("#### Inspecting SuperClass Methods ####");
	        System.out.println("    Methods for " + classObj.getSuperclass().getName() + " are: \\n         " + supersMethods + "\\n\\n");
	        System.out.println("#### Inspecting SuperClass Constructors ####");
	        System.out.println("    Constructors for " + classObj.getSuperclass().getName() + " are: \\n         " + supersConstructors + "\\n\\n");
	        System.out.println("#### Inspecting SuperClass Fields ####");
	        System.out.println("    Fields for " + classObj.getSuperclass().getName() + " are: " + supersFields + "\\n\\n");
	    }

	    private void printClassObjDetails(String declaringClass, String immediateSuperClass, String className, String interfaces, String methods, String constructors, String fields) {
	        System.out.println("#### Inspecting Declaring Class ####");
	        System.out.println("    Declaring Class for " + className + " is: " + declaringClass + "\\n\\n");
	        System.out.println("#### Inspecting Super Class ####");
	        System.out.println("    Super Class for " + className + " is: " + immediateSuperClass + "\\n\\n");
	        System.out.println("#### Inspecting Interfaces ####");
	        System.out.println("    Interfaces for " + className + " are: " + interfaces + "\\n\\n");
	        System.out.println("#### Inspecting Methods ####");
	        System.out.println("    Methods for " + className + " are: \\n         " + methods + "\\n\\n");
	        System.out.println("#### Inspecting Constructors ####");
	        System.out.println("    Constructors for " + className + " are: \\n         " + constructors + "\\n\\n");
	        System.out.println("#### Inspecting Fields ####");
	        System.out.println("    Fields for " + className + " are: \\n         " + fields + "\\n\\n");
	    }

	    public void recursiveInspection(Object obj, boolean recursive, LinkedList toCheckRecursively){
	        if(toCheckRecursively.size() == 0){
	            System.out.println("    Nothing to inspect. Continuing...");
	            return;
	        }
	        for(int i = 0; i &lt toCheckRecursively.size(); i++){
	            Field field = (Field) toCheckRecursively.get(i);
	            field.setAccessible(true);
	            System.out.println("    #### Currently inspecting " + field.getName() + " ####\\n");
	            try {
	                inspect(field.get(obj), recursive);
	                checked_things.add(obj);
	            }
	            catch(NullPointerException e){
	                System.out.println("    COULD NOT GET NULL FROM OBJECT. CONTINUING...");
	            }
	            catch(IllegalAccessException e){
	                System.out.println("    COULD NOT ACCESS FIELD FROM OBJECT. CONTINUING...");
	            }
	        }
	    }

	    public String inspectFields(Class classObj, Object obj, LinkedList toCheckRecursively){
	        String fieldsResult = "";
	        Field[] fields = classObj.getDeclaredFields();
	        for(int i = 0; i &lt fields.length; i++){
	            fields[i].setAccessible(true);
	            if(!fields[i].getType().isPrimitive() && fields[i] != null){
	                toCheckRecursively.add(fields[i]);
	            }
	            String type = fields[i].getType().getName();
	            String modifier = Modifier.toString(fields[i].getModifiers());
	            fieldsResult = fieldsResult + "\\n";
	            fieldsResult = fieldsResult + "         " + fields[i].getName() + "\\n";
	            fieldsResult = fieldsResult + "             type: " + type + "\\n";
	            fieldsResult = fieldsResult + "             modifiers: " + modifier + "\\n";
	            try {
	                fieldsResult = fieldsResult + "             value: " + fields[i].get(obj);
	            }
	            catch(Exception e){
	                fieldsResult = fieldsResult + "             Could not get value due to permissions";
	            }
	            if(fields[i].getType().isArray()){
	                fieldsResult = fieldsResult + "\\n";
	                fieldsResult = fieldsResult + "         " + fields[i].getName() + " is an array with the following properties: \\n";
	                fieldsResult = fieldsResult + "             Contains Type: " + fields[i].getType().getComponentType().getName() + "\\n";
	                try {
	                    fieldsResult = fieldsResult + "             Length: " + Array.getLength(fields[i].get(obj)) +"\\n";
	                }
	                catch (Exception e){
	                    fieldsResult = fieldsResult + "             Could not access length\\n";
	                }
	                fieldsResult = fieldsResult + "             Elements: {";
	                try {
	                    for (int j = 0; j &lt Array.getLength(fields[i].get(obj)); j++) {
	                        Object ele = Array.get(fields[i].get(obj), j);
	                        fieldsResult = fieldsResult + ele + ", ";

	                    }
	                    if(Array.getLength(fields[i].get(obj)) != 0){
	                        fieldsResult = fieldsResult.trim();
	                        fieldsResult = fieldsResult.substring(0, fieldsResult.length() - 1);
	                    }
	                    fieldsResult = fieldsResult + "}";

	                }
	                catch(IllegalArgumentException e){
	                    e.printStackTrace();
	                    fieldsResult = fieldsResult + "Expected Array: got type " + fields[i].getType() + "}".toUpperCase();
	                }
	                catch(IllegalAccessException e){
	                    fieldsResult = fieldsResult + "Could not access elements}".toUpperCase();
	                }
	            }
	        }

	        return fieldsResult;
	    }

	    public String inspectConstructors(Class classObj){
	        String constrResult = "";
	        Constructor[] cArr = classObj.getConstructors();
	        for(int i = 0; i &lt cArr.length; i++){
	            cArr[i].setAccessible(true);
	            Class[] params = cArr[i].getParameterTypes();
	            String modifies = Modifier.toString(cArr[i].getModifiers());
	            constrResult = constrResult + "\\n";
	            constrResult = constrResult + "         " + cArr[i].getName() + "(";
	            for(int j = 0; j &lt params.length; j++){
	                constrResult = constrResult + params[j].getName() + ", ";
	            }
	            if(params.length != 0){
	                constrResult = constrResult.trim();
	                constrResult = constrResult.substring(0, constrResult.length() - 1);
	            }
	            constrResult = constrResult + ")\\n";
	            constrResult = constrResult + "           with modifiers: " + modifies;
	        }

	        return constrResult;
	    }

	    public String inspectMethods(Class classObj){
	        String methodsResult = "";
	        Method[] mArr = classObj.getMethods();
	        for(int i = 0; i &lt mArr.length; i++){
	            mArr[i].setAccessible(true);
	            Class[] execps = mArr[i].getExceptionTypes();
	            Class[] params = mArr[i].getParameterTypes();
	            Class rtype = mArr[i].getReturnType();
	            String modifies = Modifier.toString(mArr[i].getModifiers());
	            methodsResult = methodsResult + "\\n";
	            methodsResult = methodsResult + "         " + mArr[i].getName() + "\\n";
	            methodsResult = methodsResult + "             exceptions: ";
	            for(int j = 0; j &lt execps.length; j++){
	                methodsResult = methodsResult + execps[j].getName() + ", ";
	            }
	            if (execps.length != 0) {
	                methodsResult = methodsResult.trim();
	                methodsResult = methodsResult.substring(0, methodsResult.length() - 1);
	            }
	            methodsResult = methodsResult + "\\n             parameters: ";
	            for(int j = 0; j &lt params.length; j++){
	                methodsResult = methodsResult + params[j].getName() + ", ";
	            }
	            if(params.length != 0){
	                methodsResult = methodsResult.trim();
	                methodsResult = methodsResult.substring(0, methodsResult.length() - 1);
	            }
	            methodsResult = methodsResult + "\\n             return type: ";
	            methodsResult = methodsResult + rtype.getName();
	            methodsResult = methodsResult + "\\n             modifiers: ";
	            methodsResult = methodsResult + modifies;
	        }

	        return methodsResult;
	    }

	    public String inspectInterfaces(Class classObj) {
	        Class[] interArr = classObj.getInterfaces();
	        String interfaceResult = "";
	        if(interArr.length &lt 1){
	            return "No implemented interfaces";
	        }
	        else{
	            for(int i = 0; i &lt interArr.length; i++){
	                interfaceResult = interfaceResult + interArr[i].getName() + ", ";
	            }
	            interfaceResult = interfaceResult.trim();
	            interfaceResult = interfaceResult.substring(0, interfaceResult.length() - 1);
	            return interfaceResult;
	        }
	    }

	    public String inspectDeclaringClass(Class classObj){
	        return classObj.getName();
	    }

	    public String inspectImmediateSuperClass(Class classObj){
	        return classObj.getSuperclass().getName();
	    }
	}`
	}
}