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
	},
	ri:{
		type: 'java',
		code: `
	import java.lang.reflect.*;
	import java.util.ArrayList;
	import java.util.LinkedList;
	import java.util.List;

	public class ReflectiveInspector {

	        public List<String> already_visited_class = new ArrayList<>();

	        public void inspect(Object obj, boolean recursive) throws IllegalAccessException {
	            if(obj == null){
	                System.out.println("Cannot operate on a NULL object. Exiting now...");
	                return;
	            }
	            LinkedList recursiveList = new LinkedList();
	            Class classObj = obj.getClass();
	            if(already_visited_class.contains(classObj.getTypeName())){
	                return;
	            }
	            System.out.println("Currently inspecting object of type: " + classObj.getTypeName());
	            System.out.println("Recursive option is set to: " + recursive);

	            if(classObj.isPrimitive()){
	                System.out.println("Currently inspecting primitive object: " + classObj.getTypeName());
	                //Do Some work
	            }
	            else if(!classObj.isArray()){
	                System.out.println("Declaring Class: " + getDeclaringClass(classObj));

	                getInterface(obj,classObj, recursiveList, recursive);
	                getMethods(classObj);
	                getConstructors(classObj);
	                getFields(obj,classObj, recursiveList, recursive);
	                getFieldValue(classObj);
	                already_visited_class.add(classObj.getTypeName());
	                if(recursiveList.size() > 0){
	                    getRecursive(obj,classObj, recursiveList, recursive);
	                }

	                if(recursive){
	                    if(classObj.isPrimitive()){
	                        recursive = false;
	                    }
	                    getRecursive(obj,classObj, recursiveList, recursive);
	                }
	            }
	            else{
	                for(int i = 0; i < Array.getLength(obj); i++){
	                /*Have to do this recursively because we need to go through every element of the array (Which could
	                also be an array, but we have no way of knowing until runtime)
	                 */
	                    inspect(Array.get(obj, i), recursive);
	                }
	            }

	        }

	        public void getRecursive(Object obj,Class classObj, LinkedList recursiveList, boolean recursive) throws IllegalAccessException {
	            if(recursiveList.size() == 0){ return;}
	            System.out.println("Recursively inspecting: " + classObj.getName());
	            for(int i = 0; i < recursiveList.size(); i++){
	                Field f = (Field) recursiveList.get(i);
	                System.out.println("    Lets deep dive into: " + f.getName());
	                if(recursive){
	                    inspect(f.get(obj), recursive);
	                }

	            }
	        }

	        public void getMethods(Class classObj){
	            Method[] mArr= classObj.getMethods();
	            System.out.println("Methods of " + classObj.getName() + " are: ");
	            for(int i = 0; i < mArr.length; i++){
	                System.out.println("    " + mArr[i].getName());
	            }
	            System.out.println("\\n\\n");
	            for(int i = 0; i < mArr.length; i++){
	                Method method = mArr[i];
	                System.out.println("    " + method.getName() + " has the following exceptions: ");
	                for(int j = 0; j < method.getExceptionTypes().length; j++){
	                    System.out.println("        " + method.getExceptionTypes()[j].getName());
	                }
	                System.out.println("    " + method.getName() + " has the following parameter types: ");
	                for(int j = 0; j < method.getParameters().length; j++){
	                    System.out.println("        " + method.getParameters()[j].getParameterizedType());
	                }
	                System.out.println("    " + method.getName() + " has the following return type: " + method.getReturnType());
	                System.out.println("    " + method.getName() + " has the following modifiers: " + Modifier.toString(method.getModifiers()));
	                System.out.print("\\n\\n");
	            }
	        }

	        public void getConstructors(Class classObj){
	            Constructor[] conArr = classObj.getConstructors();
	            System.out.println("Constructors of " + classObj.getName() + " are: ");
	            for(int i = 0; i < conArr.length; i++){
	                System.out.println("    " + conArr[i].getName() + "(" + conArr[i].getParameterCount()+ ")");
	            }
	            System.out.println("\\n");
	            for(int i = 0; i < conArr.length; i++){
	                Constructor constructor = conArr[i];
	                System.out.println("    " + constructor.getName()+ "(" + conArr[i].getParameterCount()+ ")" + " has the following parameter types: ");
	                for(int j = 0; j < constructor.getParameters().length; j++){
	                    System.out.println("        " + constructor.getParameters()[j].getParameterizedType());
	                }
	                System.out.println("    " + constructor.getName()+ "(" + conArr[i].getParameterCount()+ ")" + " has the following modifiers: " + Modifier.toString(constructor.getModifiers()));
	                System.out.println("\\n");
	            }
	        }

	        public void getFields(Object obj, Class classObj, LinkedList recursiveList, boolean recursive) throws IllegalAccessException {
	            Field[] fArr = classObj.getDeclaredFields();
	            System.out.println("Fields of " + classObj.getName() + " are: ");
	            if( fArr == null){
	                return;
	            }
	            for(int i = 0; i < fArr.length; i++){
	                Field field= fArr[i];
	                if(field == null){ continue;}
	                try {
	                    field.setAccessible(true);
	                    if (!field.getType().isPrimitive()) {
	                        recursiveList.add(field);
	                    }
	                    System.out.println("    " + field.getName());
	                    System.out.println("        " + field.getName() + " has the following type: " + field.getType().getName());
	                    System.out.println("        " + field.getName() + " has the following modifiers: " + Modifier.toString(field.getModifiers()));
	                    if (field.getType() == null && !recursive) {
	                        System.out.println("        " + field.getName() + " is a reference with value: " + field.getClass() + field.hashCode());
	                    } else {
	                        System.out.println("        " + field.getName() + " has value of: " + field.get(obj));
	                    }
	                    if (field.getType().isArray() && field.get(obj) != null) {
	                        System.out.println("        " + field.getName() + " is an array with the following properties: ");
	                        System.out.println("            Length: " + Array.getLength(field.get(obj)));
	                        System.out.println("            Contains type: " + field.getType().getComponentType().getName());
	                        System.out.println("            Elements: ");
	                        for (int j = 0; j < Array.getLength(field.get(obj)); j++) {
	                            System.out.println("                " + Array.get(field.get(obj), j));
	                        }
	                    }
	                }
	                catch(InaccessibleObjectException e){
	                    System.out.println("Unable to access" + field.getName() + ". Continuing...");
	                }

	            }
	        }

	        public void getFieldValue(Class classObj){
	            return;
	        }

	        public void getInterface(Object obj,Class classObj, LinkedList recursiveList, boolean recursive) throws IllegalAccessException {
	            Class[] cArr = classObj.getInterfaces();
	            if(!classObj.isInterface()){
	                System.out.println("Implemented Interfaces: ");
	                for(int i = 0; i < cArr.length; i++){
	                    System.out.println("    " + cArr[i].getName());
	                }
	            }
	            else{
	                for(int i = 0; i < cArr.length; i++){
	                    getMethods(cArr[i]);
	                    getConstructors(cArr[i]);
	                    getFields(obj,cArr[i], recursiveList, recursive);
	                    getFieldValue(cArr[i]);
	                }
	            }
	        }

	        public void getImmSuperClass(Object obj,Class classObj, LinkedList recursiveList, boolean recursive) throws IllegalAccessException {
	            Class superc = classObj.getSuperclass();
	            System.out.println("Immediate Superclass: " + superc.getName());
	            System.out.println("Superclass has the following properties: ");
	            if(superc != null) {
	                getMethods(superc);
	                getConstructors(superc);
	                getFields(obj,superc, recursiveList, recursive);
	                getFieldValue(superc);
	            }
	        }

	        public String getDeclaringClass(Class classObj) {
	            return classObj.getName();
	        }
	}`
	},
	it: {
		type: 'java',
		code: ``
	},
	
}